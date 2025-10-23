import React, { useEffect, useRef, useState } from "react";

type ConfettiParticle = {
  x: number;
  y: number;
  r: number; // lijndikte (rechthoek-strook)
  d: number; // afwijking
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
  duration: number; // totale tijd als vangnet (ms)
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
      setFade(false);
      setVisible(false);
      return;
    }

    setVisible(true);
    setFade(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // canvas op volledige viewport + resize handler
    const setSize = () => {
      const W = typeof window !== "undefined" ? window.innerWidth : 1024;
      const H = typeof window !== "undefined" ? window.innerHeight : 768;
      canvas.width = W;
      canvas.height = H;
    };
    setSize();
    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      window.removeEventListener("resize", onResize);
      return;
    }

    const W = () => canvas.width;
    const H = () => canvas.height;

    // lekker veel confetti
    const count = Math.max(180, Math.floor(W() / 4));
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W(),
        y: Math.random() * H() - H(),
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
    let hardStop: number | null = null;

    const draw = () => {
      // clear
      ctx.clearRect(0, 0, W(), H());

      // tekenen (rechthoek-stroken met tilt → “confetti strips”)
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
          // zig-zag naar beneden
          p.y += p.vy + (Math.cos(angle + p.d) + 3 + p.r / 3) / 3;
          p.x += Math.sin(angle) * 1.2;
          p.tiltAngle += p.tiltAngleIncremental;
          p.tilt = Math.sin(p.tiltAngle) * 15;

          if (p.y >= H() - 2) {
            p.y = H() - 2;
            p.settled = true;
          } else {
            allSettled = false;
          }
        }
      }

      // 2s laten liggen zodra alles beneden ligt
      if (allSettled && settledTimeStart === null) {
        settledTimeStart = performance.now();
      }
      if (settledTimeStart !== null) {
        const elapsed = performance.now() - settledTimeStart;
        if (elapsed >= 2000) {
          setFade(true);
          if (!stopTimerRef.current) {
            stopTimerRef.current = window.setTimeout(() => {
              if (rafRef.current) cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
              setVisible(false);
              setFade(false);
            }, 500); // fade-out tijd
          }
        }
      }
    };

    draw();

    // vangnet: forceer beëindiging na 'duration'
    hardStop = window.setTimeout(() => {
      setFade(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.setTimeout(() => {
        setVisible(false);
        setFade(false);
      }, 500);
    }, Math.max(1000, duration));

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (hardStop) window.clearTimeout(hardStop);
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
      window.removeEventListener("resize", onResize);
      setFade(false);
    };
  }, [active, duration]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: fade ? 0 : 1,
        transition: "opacity 0.5s linear",
      }}
    />
  );
};

export default Confetti;
