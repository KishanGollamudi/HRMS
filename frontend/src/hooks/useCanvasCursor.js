import { useEffect } from 'react';

const useCanvasCursor = (canvasId = 'canvas-cursor') => {
  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let running = true;

    const pos    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lines  = [];
    const E      = { friction: 0.5, trails: 25, size: 50, dampening: 0.25, tension: 0.98 };

    // ── Oscillator ──────────────────────────────────────────
    let phase     = Math.random() * 2 * Math.PI;
    let hue       = 285;
    const freq    = 0.0015;

    function updateHue() {
      phase += freq;
      hue    = 285 + Math.sin(phase) * 85;
      return hue;
    }

    // ── Node ────────────────────────────────────────────────
    function Node() { this.x = pos.x; this.y = pos.y; this.vx = 0; this.vy = 0; }

    // ── Line ────────────────────────────────────────────────
    function Line(spring) {
      this.spring   = spring + 0.1 * Math.random() - 0.02;
      this.friction = E.friction + 0.01 * Math.random() - 0.002;
      this.nodes    = Array.from({ length: E.size }, () => new Node());
    }

    Line.prototype.update = function () {
      let sp = this.spring;
      const head = this.nodes[0];
      head.vx += (pos.x - head.x) * sp;
      head.vy += (pos.y - head.y) * sp;

      for (let i = 0; i < this.nodes.length; i++) {
        const t = this.nodes[i];
        if (i > 0) {
          const n = this.nodes[i - 1];
          t.vx += (n.x - t.x) * sp;
          t.vy += (n.y - t.y) * sp;
          t.vx += n.vx * E.dampening;
          t.vy += n.vy * E.dampening;
        }
        t.vx *= this.friction;
        t.vy *= this.friction;
        t.x  += t.vx;
        t.y  += t.vy;
        sp   *= E.tension;
      }
    };

    Line.prototype.draw = function () {
      let x = this.nodes[0].x;
      let y = this.nodes[0].y;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 1; i < this.nodes.length - 2; i++) {
        const a = this.nodes[i];
        const b = this.nodes[i + 1];
        x = 0.5 * (a.x + b.x);
        y = 0.5 * (a.y + b.y);
        ctx.quadraticCurveTo(a.x, a.y, x, y);
      }
      const last = this.nodes[this.nodes.length - 2];
      const end  = this.nodes[this.nodes.length - 1];
      ctx.quadraticCurveTo(last.x, last.y, end.x, end.y);
      ctx.stroke();
      ctx.closePath();
    };

    // ── Init lines ──────────────────────────────────────────
    for (let i = 0; i < E.trails; i++)
      lines.push(new Line(0.4 + (i / E.trails) * 0.025));

    // ── Resize ──────────────────────────────────────────────
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    // ── Mouse — window level so card doesn't block it ───────
    function onMouseMove(e) {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }
    function onTouchMove(e) {
      pos.x = e.touches[0].clientX;
      pos.y = e.touches[0].clientY;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove',  onTouchMove, { passive: true });
    window.addEventListener('resize',     resize);

    // ── Render loop — starts immediately ────────────────────
    function render() {
      if (!running) return;

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `hsla(${Math.round(updateHue())}, 70%, 55%, 0.25)`;
      ctx.lineWidth   = 1.5;

      lines.forEach((l) => { l.update(); l.draw(); });
      requestAnimationFrame(render);
    }

    render();

    return () => {
      running = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('resize',     resize);
    };
  }, [canvasId]);
};

export default useCanvasCursor;
