import React, { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;

  // rotatie & “flap/plooi”-gedrag
  angle: number;          // huidige rotatie (rad)
  spin: number;           // basis rotatiesnelheid (rad/frame)
  flutterPhase: number;   // fase voor wapperen
  flutterFreq: number;    // hoe snel de wappering verandert
  flutterAmp: number;     // amplitude van de wappering

  // horizontale “wind” (langzame sinus noise)
  windPhase: number;
  windSpeed: number;      // hoe snel de windfase toeneemt
  windAmp: number;        // horizontale amplitude

  settled: boolean;       // ligt op de bodem?
  restingFrames: number;  // aantal frames dat hij al stil ligt
};

const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
];

// Wereldconstanten – kun je vrij tunen
const GRAVITY = 0.18;            // zwaartekracht per frame
const DRAG_BASE = 0.008;         // basis-luchtweerstand
const TERMINAL_VY = 9.0;         // maximale valsnelheid
const GROUND_BOUNCE = 0.28;      // restitutie bij eerste bots
const GROUND_FRICTION = 0.85;    // wrijving op bodem
const SETTLE_SPEED = 0.45;       // drempel om “stil” te beschouwen
const LINGER_MS = 2000;          // hoe lang ze blijven liggen

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  active: boolean;
  /** Totale duur in ms (inclusief liggen + fade) */
  duration: number;
}

const Confetti: React.FC<Props> = ({ active, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas grootte en resize
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Aantal deeltjes schaalt met schermbreedte
    const count = Math.max(220, Math.floor(window.innerWidth * 0.35));

    const parts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const w = rand(6, 12);
      const h = rand(10, 18);
      parts.push({
        x: Math.random() * canvas.width,
        y: -rand(0, canvas.height), // start boven het scherm
        vx: rand(-0.6, 0.6),
        vy: rand(0.5, 2.0),
        w,
        h,
        color: pick(COLORS),

        angle: rand(0, Math.PI * 2),
        spin: rand(-0.08, 0.08),

        // “flapperen” (plooi-gevoel): kleine extra sinus op de rotatie
        flutterPhase: rand(0, Math.PI * 2),
        flutterFreq: rand(0.05, 0.12),
        flutterAmp: rand(0.12, 0.28),

        // langzame zijwind via sinus-noise
        windPhase: rand(0, Math.PI * 2),
        windSpeed: rand(0.003, 0.012),
        windAmp: rand(0.4, 1.6),

        settled: false,
        restingFrames: 0,
      });
    }

    let start = performance.now();
    let lingerStart: number | null = null;

    const step = (now: number) => {
      const elapsed = now - start;

      // UPDATE
      let settledCount = 0;
      for (const p of parts) {
        if (!p.settled) {
          // horizontale wind (langzaam variërende sinus)
          p.windPhase += p.windSpeed;
          const wind = Math.sin(p.windPhase) * p.windAmp;

          // zwaartekracht + luchtweerstand afhankelijk van “frontaal oppervlak”
          const drag = DRAG_BASE * (1 + Math.abs(Math.sin(p.angle)) * 1.8);
          p.vy = Math.min(TERMINAL_VY, p.vy + GRAVITY);
          p.vy *= 1 - drag;
          p.vx += wind * 0.02;           // beetje doorwind
          p.vx *= 1 - drag * 0.5;        // laterale demping

          // rotatie + wappering
          p.flutterPhase += p.flutterFreq;
          const flap = Math.sin(p.flutterPhase) * p.flutterAmp;
          p.angle += p.spin + flap * 0.12;

          // positie updaten
          p.x += p.vx + Math.sin(p.flutterPhase) * 0.2; // kleine zigzag extra
          p.y += p.vy;

          // bodem interactie
          const groundY = canvas.height - p.h * 0.5;
          if (p.y >= groundY) {
            p.y = groundY;
            if (Math.abs(p.vy) > SETTLE_SPEED) {
              // kleine stuiter + wrijving
              p.vy = -p.vy * GROUND_BOUNCE;
              p.vx *= GROUND_FRICTION;
              p.spin *= 0.6;
            } else {
              p.vy = 0;
              p.vx *= GROUND_FRICTION;
              if (Math.abs(p.vx) < 0.05) {
                p.vx = 0;
                p.settled = true;
              }
            }
          }

          // zachte zijgrenzen
          if (p.x < -30) { p.x = -30; p.vx *= -0.3; }
          if (p.x > canvas.width + 30) { p.x = canvas.width + 30; p.vx *= -0.3; }
        }

        if (p.settled) {
          settledCount++;
          p.restingFrames++;
        } else {
          p.restingFrames = 0;
        }
      }

      // TEKEN
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      for (const p of parts) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        // teken als centered rechthoek (mooier bij rotatie)
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      ctx.restore();

      // Als >90% ligt, start “linger” timer
      if (settledCount / parts.length > 0.9 && lingerStart === null) {
        lingerStart = now;
      }
      // Na 2s liggen -> fade-out
      if (lingerStart !== null && now - lingerStart >= LINGER_MS && !fadeOut) {
        setFadeOut(true);
      }

      // Stop na totale duur
      if (elapsed >= duration) {
        cleanup();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    const cleanup = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", setSize);
      setFadeOut(false);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    rafRef.current = requestAnimationFrame(step);

    // harde stop backup
    const hard = setTimeout(() => cleanup(), duration + 100);

    return () => {
      clearTimeout(hard);
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
        transition: "opacity 0.9s ease-out",
      }}
    />
  );
};

export default Confetti;
