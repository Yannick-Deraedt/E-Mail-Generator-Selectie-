import React, { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  w: number;        // breedte (rechthoek)
  h: number;        // hoogte (rechthoek)
  color: string;
  speedY: number;   // verticale snelheid
  phase: number;    // fase voor zigzag
  amp: number;      // amplitude voor zigzag
  tilt: number;     // rotatie
  tiltSpeed: number;
  landed: boolean;
  landedAt: number | null; // ms timestamp
};

const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  active: boolean;
  duration: number; // ms
  // optioneel: linger tijd (ms) dat confetti op de bodem blijft liggen
  lingerMs?: number;
}

const Confetti: React.FC<Props> = ({ active, duration, lingerMs = 2500 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!active) return;

    setFade(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = () => canvas.width;
    const H = () => canvas.height;

    const count = Math.min(500, Math.floor(W() / 4)); // hogere density dan voorheen
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W(),
        y: Math.random() * H() - H(),
        w: rand(6, 14),
        h: rand(10, 22),
        color: pick(COLORS),
        speedY: rand(1.2, 2.4),      // langzamer voor mooier vallen
        phase: rand(0, Math.PI * 2), // voor zigzag
        amp: rand(10, 35),           // amplitude zigzag
        tilt: rand(0, Math.PI * 2),
        tiltSpeed: rand(-0.05, 0.05),
        landed: false,
        landedAt: null
      });
    }

    let raf = 0;
    let startTime = performance.now();
    let endTime = startTime + duration + lingerMs;
    let fadeStart = endTime - 700; // laatste ~0.7s fade-out

    const ground = H() - 6; // bodem lijn

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      const now = performance.now();
      const elapsed = now - startTime;

      // Fade toggle
      if (now >= fadeStart) setFade(true);

      // Update & teken
      for (const p of particles) {
        if (!p.landed) {
          // zigzag horizontaal (links <-> rechts)
          const zigzagX = Math.sin((elapsed / 600) + p.phase) * p.amp;
          p.y += p.speedY + p.h * 0.02;
          p.x += zigzagX * 0.02; // subtiele horizontale beweging
          p.tilt += p.tiltSpeed;

          // buiten scherm links/rechts terug in beeld houden
          if (p.x < -20) p.x = W() + 20;
          if (p.x > W() + 20) p.x = -20;

          // geland?
          if (p.y + p.h / 2 >= ground) {
            p.y = ground - p.h / 2;
            p.landed = true;
            p.landedAt = now;
          }
        } else {
          // blijft liggen tot lingerMs voorbij is; daarna niets doen (alleen fade)
        }

        // tekenen als rechthoekje met rotatie
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tilt);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (now < endTime) {
        raf = requestAnimationFrame(draw);
      }
    };

    // Resize handler
    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize);

    // Start animatie
    raf = requestAnimationFrame(draw);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      setFade(false);
    };
  }, [active, duration, lingerMs]);

  return active ? (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: fade ? 0 : 1,
        transition: "opacity 0.7s linear"
      }}
    />
  ) : null;
};

export default Confetti;
