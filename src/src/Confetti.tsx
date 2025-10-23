import React, { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  w: number;     // breedte
  h: number;     // hoogte
  vy: number;    // verticale snelheid
  vxA: number;   // amplitude voor zigzag (sinus)
  vxW: number;   // frequentie voor zigzag
  phase: number; // startfase voor sinus
  color: string;
  settled: boolean; // ligt op de bodem
};

const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  active: boolean;
  /** totale duur in ms (inclusief 2s liggen + fade) */
  duration: number;
}

const Confetti: React.FC<Props> = ({ active, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // full screen + resize
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // particles genereren (meer op brede schermen)
    const count = Math.max(160, Math.floor(window.innerWidth * 0.25));
    const parts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -rand(0, canvas.height),           // vanaf boven verspreid
        w: rand(6, 12),
        h: rand(10, 18),
        vy: rand(2.2, 3.6),
        vxA: rand(0.6, 1.4) * (Math.random() < 0.5 ? -1 : 1), // zigzag amplitude (px per frame via sin)
        vxW: rand(0.012, 0.025),              // zigzag frequentie
        phase: Math.random() * Math.PI * 2,
        color: pick(COLORS),
        settled: false,
      });
    }

    let t0 = performance.now();
    let phaseTime = 0; // voor sin-beweging
    let lingerStart: number | null = null; // moment dat alles ligt

    const draw = (now: number) => {
      const elapsed = now - t0;
      phaseTime += 1; // incrementele tijd voor zijwaarts sin

      // update
      let allSettled = true;
      for (const p of parts) {
        if (!p.settled) {
          // zigzag
          const vx = Math.sin(p.phase + phaseTime * p.vxW) * p.vxA;
          p.x += vx;
          p.y += p.vy;
          // bodem?
          const bottom = canvas.height - p.h / 2;
          if (p.y >= bottom) {
            p.y = bottom;
            p.settled = true;
          } else {
            allSettled = false;
          }
        }
        // aan randen re-bounce zachtjes zodat alles zichtbaar blijft
        if (p.x < -20) p.x = -20;
        if (p.x > canvas.width + 20) p.x = canvas.width + 20;
      }

      // tekenen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      // lichte overall fade als fadeOut aanstaat
      if (fadeOut) {
        ctx.globalAlpha = 0.0; // canvas opacity geregeld via style, dus hier 1 laten
      }
      for (const p of parts) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
      ctx.restore();

      // als alles ligt -> 2s laten liggen, daarna fade starten (als dat nog niet gestart is)
      if (allSettled && lingerStart === null) {
        lingerStart = now;
      }
      if (lingerStart !== null && !fadeOut) {
        if (now - lingerStart >= 2000) {
          setFadeOut(true);
        }
      }

      // stop criteria: totale duur voorbij
      if (elapsed >= duration) {
        cleanup();
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const cleanup = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", setSize);
      setFadeOut(false);
      // canvas leegmaken
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    rafRef.current = requestAnimationFrame(draw);

    // safety stop (fallback) exact op duration
    const hardStop = setTimeout(() => {
      cleanup();
    }, duration + 50);

    return () => {
      clearTimeout(hardStop);
      cleanup();
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s linear",
      }}
    />
  );
};

export default Confetti;
