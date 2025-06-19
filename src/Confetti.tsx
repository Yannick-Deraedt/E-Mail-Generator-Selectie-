import { useEffect, useRef, useState } from "react";

type Props = {
  active: boolean;
  duration?: number;
};

const COLORS = [
  "#FFD700", "#1E90FF", "#32CD32", "#FF69B4", "#FFA500", "#7B68EE", "#DC143C"
];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ active, duration = 5000 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!active) return;
    setFade(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = Array.from({ length: 140 }).map(() => ({
      x: random(0, window.innerWidth),
      y: random(-150, -30),
      r: random(7, 14),
      d: random(16, 39),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      tilt: random(-12, 12),
      tiltAngle: random(0, 2 * Math.PI),
      speed: random(2.8, 5.2),
      swing: random(0.9, 2.3),
    }));

    let angle = 0;
    let running = true;
    let fadeTimeout: ReturnType<typeof setTimeout>;

    function draw() {
      if (!canvas) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y,
          p.r,
          p.r / random(1.2, 1.6),
          p.tiltAngle,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = p.color;
        ctx.globalAlpha = fade ? 0.22 : 0.82;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      update();
      if (running) requestAnimationFrame(draw);
    }

    function update() {
      angle += 0.015;
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.y += (Math.cos(angle + p.d) + p.speed + 0.6) * 1.6;
        p.x += Math.sin(angle) * p.swing;
        p.tiltAngle += 0.1 * Math.sin(angle);
        if (p.y > window.innerHeight) {
          p.y = random(-40, -10);
          p.x = random(0, window.innerWidth);
        }
      }
    }

    draw();

    fadeTimeout = setTimeout(() => setFade(true), duration - 1100);

    return () => {
      running = false;
      clearTimeout(fadeTimeout);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [active, duration, fade]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9000,
        opacity: active ? 1 : 0,
        transition: "opacity 0.8s"
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden
    />
  );
}
