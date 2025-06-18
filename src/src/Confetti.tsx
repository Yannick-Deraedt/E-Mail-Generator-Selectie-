import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
  duration?: number; // in ms, default 5000
}

const COLORS = [
  "#1565c0", "#42a5f5", "#64b5f6", "#90caf9", "#1de9b6", "#e040fb",
  "#ffd600", "#ff4081", "#69f0ae", "#536dfe", "#ff1744", "#f50057"
];

export default function Confetti({ active, duration = 5000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const PARTICLE_COUNT = 220;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 10 + 6,
      d: Math.random() * PARTICLE_COUNT,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleIncremental: Math.random() * 0.09 + 0.01
    }));

    let angle = 0;

    function drawConfetti() {
      // Check nogmaals canvas en ctx
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.r);
        ctx.stroke();
      });

      updateConfetti();
      animationRef.current = requestAnimationFrame(drawConfetti);
    }

    function updateConfetti() {
      angle += 0.01;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.y += (Math.cos(angle + p.d) + 2 + p.r / 2) / 1.7;
        p.x += Math.sin(angle) * 2.2;
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 16;

        // Reset to top if out of view
        if (canvas && p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      }
    }

    drawConfetti();

    // Stop after `duration`
    const stopTimeout = setTimeout(() => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // check canvas/ctx again
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, duration);

    // Clean up
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      clearTimeout(stopTimeout);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, duration]);

  // Canvas is always present, but visible only when active
  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: "none",
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1001,
        display: active ? "block" : "none"
      }}
      width={typeof window !== "undefined" ? window.innerWidth : 1920}
      height={typeof window !== "undefined" ? window.innerHeight : 1080}
      aria-hidden="true"
    />
  );
}
