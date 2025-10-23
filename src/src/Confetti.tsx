import React, { useEffect, useRef, useState } from "react";

type ConfettiParticle = {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngle: number;
  tiltAngleIncremental: number;
  vy: number; // verticale snelheid
  settled: boolean; // ligt op de bodem
};

const COLORS = [
  "#f44336","#e91e63","#9c27b0","#673ab7","#3f51b5",
  "#2196f3","#03a9f4","#00bcd4","#009688","#4caf50",
  "#8bc34a","#cddc39","#ffeb3b","#ffc107","#ff9800","#ff5722"
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface ConfettiProps {
  active: boolean;
  duration: number; // ms totale tijd (inclusief 2s settle + 0.5s fade)
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stopTimer = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!active) {
      // netjes opruimen en unmounten
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (stopTimer.current) window.clearTimeout(stopTimer.current);
      stopTimer.current = null;
      setFade(false);
      setVisible(false);
      return;
    }

    setVisible(true);
    setFade(false);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const count = Math.max(180, Math.floor(W / 4)); // véél confetti
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: randomInt(7, 15),
        d: randomInt(10, 40),
        color: randomColor(),
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        vy: 1 + Math.random() * 2.2,
        settled: false,
      });
    }

    let angle = 0;
    let settledTimeStart: number | null = null;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      // tekenen (rechthoek-stroken met tilt)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
        ctx.stroke();
      }

      update();

      rafRef.current = requestAnimationFrame(draw);
    };

    const update = () => {
      angle += 0.02;

      let allSettled = true;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!p.settled) {
          // zig-zag dalen
          p.y += p.vy + (Math.cos(angle + p.d) + 3 + p.r / 3) / 3;
          p.x += Math.sin(angle) * 1.2;
          p.tiltAngle += p.tiltAngleIncremental;
          p.tilt = Math.sin(p.tiltAngle) * 15;

          // bodem check
          if (p.y >= H - 2) {
            p.y = H - 2;
            p.settled = true;
          } else {
            allSettled = false;
          }
        }
      }

      // als alles ligt, 2s laten liggen en dan fade-out
      if (allSettled && settledTimeStart === null) {
        settledTimeStart = performance.now();
      }
      if (settledTimeStart !== null) {
        const elapsed = performance.now() - settledTimeStart;
        if (elapsed >= 2000) {
          // start fade-out en stop snel daarna
          setFade(true);
          // na 500ms (fade), onzichtbaar + cleanup
          if (!stopTimer.current) {
            stopTimer.current = window.setTimeout(() => {
              if (rafRef.current) cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
              setVisible(false);
              setFade(false);
            }, 500);
          }
        }
      }
    };

    draw();

    // complete hard-stop als extra vangnet (na duration)
    const hardStop = window.setTimeout(() => {
      setFade(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.setTimeout(() => {
        setVisible(false);
        setFade(false);
      }, 500);
    }, Math.max(1000, duration)); // minimaal 1s

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.clearTimeout(hardStop);
      if (stopTimer.current) window.clearTimeout(stopTimer.current);
      stopTimer.current = null;
      setFade(false);
    };
  }, [active, duration]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: fade ? 0 : 1,
        transition: "opacity 0.5s linear",
      }}
    />
  );
};

export default Confetti;
