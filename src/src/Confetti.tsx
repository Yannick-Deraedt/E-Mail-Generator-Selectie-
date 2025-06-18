import React, { useEffect, useRef, useState } from "react";

interface ConfettiProps {
  active: boolean;
  duration?: number; // duur in ms
}

const COLORS = [
  "#142c54", "#1679bc", "#71c7ec", "#f9dd16", "#e66472",
  "#ffae00", "#aaffc3", "#fff", "#e7effb", "#cf65ff"
];

export default function Confetti({ active, duration = 5000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    if (active) {
      setShow(true);

      // Basic confetti setup
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;

      // Confetti particles
      const numConfetti = 800;
      const confetti = Array.from({ length: numConfetti }).map(() => ({
        x: Math.random() * W,
        y: Math.random() * -H,
        r: Math.random() * 6 + 5,
        d: Math.random() * numConfetti,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        tilt: Math.random() * 20 - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
      }));

      function drawConfetti() {
        ctx.clearRect(0, 0, W, H);
        confetti.forEach((p, i) => {
          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
          ctx.stroke();
        });
        updateConfetti();
        animationFrameId = requestAnimationFrame(drawConfetti);
      }

      function updateConfetti() {
        confetti.forEach(p => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 4) * 0.6;
          p.x += Math.sin(0.5) + Math.sin(p.d);
          p.tilt = Math.sin(p.tiltAngle - (p.d / 3)) * 15;

          // Recycle confetti when out of view
          if (p.y > H + 20) {
            p.y = -20;
            p.x = Math.random() * W;
          }
        });
      }

      drawConfetti();

      timeoutId = setTimeout(() => {
        setShow(false);
        cancelAnimationFrame(animationFrameId);
      }, duration);

      // Stop effect after duration
      return () => {
        setShow(false);
        cancelAnimationFrame(animationFrameId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [active, duration]);

  return show ? (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        pointerEvents: "none",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99,
      }}
    />
  ) : null;
}
