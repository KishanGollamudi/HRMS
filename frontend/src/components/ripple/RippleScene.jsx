import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import Model from './Model';
import useDimension from './hooks/useDimension';

export default function RippleScene({ containerRef, role, label, tagline }) {
  const device = useDimension();
  if (!device.width || !device.height) return null;

  const frustumSize = device.height;
  const aspect      = device.width / device.height;

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas>
        <OrthographicCamera
          makeDefault
          args={[
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) /  2,
             frustumSize           /  2,
             frustumSize           / -2,
            -1000, 1000,
          ]}
          position={[0, 0, 2]}
        />
        <Suspense fallback={null}>
          <Model
            containerRef={containerRef}
            role={role}
            label={label}
            tagline={tagline}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
