import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useMouse from './hooks/useMouse';
import useDimension from './hooks/useDimension';
import { vertex, fragment } from './shaders';

const LOGO = 'https://res.cloudinary.com/dgx25btzm/image/upload/v1732010481/72res_zr0pot.png';
const MAX  = 100;

// Generate a soft radial brush texture via canvas
function makeBrushTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Build a canvas texture with logo + role text
function makeContentTexture({ role }) {
  const W = 512, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Background gradient matching the panel
  const grad = ctx.createLinearGradient(0, 0, W * 0.6, H);
  if (role === 'trainer') {
    grad.addColorStop(0, '#0d4f4a');
    grad.addColorStop(0.5, '#0d9488');
    grad.addColorStop(1, '#14b8a6');
  } else if (role === 'hr') {
    grad.addColorStop(0, '#832b39');
    grad.addColorStop(0.5, '#D45769');
    grad.addColorStop(1, '#e48c99');
  } else {
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.5, '#1a1a1a');
    grad.addColorStop(1, '#262626');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow in center
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.55);
  glow.addColorStop(0,   'rgba(255,255,255,0.08)');
  glow.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  return { canvas: c, texture: new THREE.CanvasTexture(c) };
}

export default function Model({ containerRef, role, label, tagline }) {
  const { viewport, gl, camera: threeCamera } = useThree();
  const device   = useDimension();
  const mouse    = useMouse();

  const logoTex     = useTexture(LOGO);
  const brushTexRef = useRef(makeBrushTexture());
  const meshRefs    = useRef([]);
  const prevMouse   = useRef({ x: 0, y: 0 });
  const currentWave = useRef(0);
  const rippleScene = useRef(new THREE.Scene());

  const imageSceneRef  = useRef(null);
  const imageCameraRef = useRef(null);
  const contentTexRef  = useRef(null);

  const uniforms = useRef({
    uDisplacement: { value: null },
    uTexture:      { value: null },
    winResolution: { value: new THREE.Vector2(1, 1) },
  });

  const fboBase    = useFBO(device.width  || 1, device.height || 1);
  const fboTexture = useFBO(device.width  || 1, device.height || 1);

  // Rebuild content texture when role changes
  useEffect(() => {
    if (contentTexRef.current) contentTexRef.current.dispose();
    const { texture } = makeContentTexture({ role });
    contentTexRef.current = texture;
  }, [role, label, tagline]);

  // Build image scene: background gradient + logo centered
  useEffect(() => {
    if (!logoTex || !viewport.width || !contentTexRef.current) return;

    const s = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(
      viewport.width  / -2, viewport.width  / 2,
      viewport.height / 2,  viewport.height / -2,
      -1000, 1000,
    );
    cam.position.z = 2;
    s.add(cam);

    // Full-panel background using the canvas gradient texture
    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(viewport.width, viewport.height),
      new THREE.MeshBasicMaterial({ map: contentTexRef.current }),
    );
    bgMesh.position.z = 0;
    s.add(bgMesh);

    // Logo — centered, square, reasonable size
    const logoSize = Math.min(viewport.width, viewport.height) * 0.38;
    const logoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(logoSize, logoSize),
      new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }),
    );
    logoMesh.position.set(0, viewport.height * 0.06, 1);
    s.add(logoMesh);

    imageSceneRef.current  = s;
    imageCameraRef.current = cam;
  }, [logoTex, viewport.width, viewport.height, role]);

  // Build brush meshes once
  useEffect(() => {
    meshRefs.current = Array.from({ length: MAX }).map(() => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshBasicMaterial({ transparent: true, map: brushTexRef.current }),
      );
      mesh.rotation.z = Math.random() * Math.PI * 2;
      mesh.visible    = false;
      return mesh;
    });
  }, []);

  function setNewWave(x, y, idx) {
    const mesh = meshRefs.current[idx];
    if (!mesh) return;
    mesh.position.set(x, y, 0);
    mesh.visible          = true;
    mesh.material.opacity = 1;
    mesh.scale.set(1.75, 1.75, 1);
  }

  useFrame(({ scene: finalScene }) => {
    if (!imageSceneRef.current || !imageCameraRef.current) return;

    // Mouse relative to panel center
    let mx, my;
    if (containerRef?.current) {
      const r = containerRef.current.getBoundingClientRect();
      mx =  mouse.x - r.left - r.width  / 2;
      my = -(mouse.y - r.top  - r.height / 2);
    } else {
      mx =  mouse.x - device.width  / 2;
      my = -mouse.y + device.height / 2;
    }

    if (Math.abs(mx - prevMouse.current.x) > 0.1 || Math.abs(my - prevMouse.current.y) > 0.1) {
      currentWave.current = (currentWave.current + 1) % MAX;
      setNewWave(mx, my, currentWave.current);
    }
    prevMouse.current = { x: mx, y: my };

    meshRefs.current.forEach((mesh) => {
      if (!mesh?.visible) return;
      mesh.rotation.z       += 0.025;
      mesh.material.opacity *= 0.95;
      mesh.scale.x           = mesh.scale.x * 0.98 + 0.155;
      mesh.scale.y           = mesh.scale.y * 0.98 + 0.155;
      if (mesh.material.opacity < 0.002) mesh.visible = false;
    });

    if (device.width > 0 && device.height > 0) {
      // 1. Brush meshes → displacement fbo
      gl.setRenderTarget(fboBase);
      gl.clear();
      meshRefs.current.forEach((m) => { if (m?.visible) rippleScene.current.add(m); });
      gl.render(rippleScene.current, threeCamera);
      meshRefs.current.forEach((m) => { if (m?.visible) rippleScene.current.remove(m); });

      // 2. Logo + bg → texture fbo
      gl.setRenderTarget(fboTexture);
      gl.render(imageSceneRef.current, imageCameraRef.current);

      // 3. Uniforms
      uniforms.current.uTexture.value      = fboTexture.texture;
      uniforms.current.uDisplacement.value = fboBase.texture;
      uniforms.current.winResolution.value.set(
        device.width  * device.pixelRatio,
        device.height * device.pixelRatio,
      );

      // 4. Final render
      gl.setRenderTarget(null);
      gl.render(finalScene, threeCamera);
    }
  }, 1);

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height, 1, 1]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        // eslint-disable-next-line react-hooks/refs -- three.js: stable uniform object mutated in useFrame
        uniforms={uniforms.current}
      />
    </mesh>
  );
}
