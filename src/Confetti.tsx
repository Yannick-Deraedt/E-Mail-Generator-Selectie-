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
  landed: boolean;
  landedTime: number | null;
  opacity: number;
};

const COLORS = [
  "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
  "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
  "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722"
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface ConfettiProps {
  active: boolean;
  duration: number; // in ms
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!active) return;
    setFade(false);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const count = Math.floor(W / 8); // responsive aantal

    // Instellingen voor liggen en uitfaden
    const LANDING_DURATION = 2000; // 2 sec blijven liggen
    const FADE_DURATION = 600;     // 0.6 sec fade out

    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: randomInt(7, 15),
        d: randomInt(10, 40),
        color: randomColor(),
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        landed: false,
        landedTime: null,
        opacity: 1
      });
    }

    let angle = 0;
    let animationFrame: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      const now = Date.now();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Set opacity (for fade-out)
        ctx.globalAlpha = p.opacity;

        // Draw confetti as lines (zoals origineel)
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
        ctx.stroke();

        ctx.globalAlpha = 1; // reset voor volgende particle

        // Update particle logic
        if (!p.landed) {
          // Beweeg zigzag naar beneden
          p.y += (Math.cos(angle + p.d) + 3 + p.r / 3) / 2;
          p.x += Math.sin(angle);
          p.tiltAngle += p.tiltAngleIncremental;
          p.tilt = Math.sin(p.tiltAngle) * 15;
          // Check bodem
          if (p.y + p.r > H) {
            p.y = H - p.r;
            p.landed = true;
            p.landedTime = now;
            p.opacity = 1;
          }
        } else {
          // Ligt op bodem: eerst wachten, dan langzaam uitfaden
          if (p.landedTime && now - p.landedTime > LANDING_DURATION) {
            const fadeElapsed = now - p.landedTime - LANDING_DURATION;
            p.opacity = Math.max(0, 1 - fadeElapsed / FADE_DURATION);
            if (p.opacity <= 0) {
              // reset particle van bovenaf opnieuw
              p.x = Math.random() * W;
              p.y = -20;
              p.landed = false;
              p.landedTime = null;
              p.opacity = 1;
              // kleine randomization voor variatie
              p.r = randomInt(7, 15);
              p.d = randomInt(10, 40);
              p.color = randomColor();
              p.tilt = Math.floor(Math.random() * 10) - 10;
              p.tiltAngle = 0;
              p.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
            }
          }
        }
      }

      angle += 0.02;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    // Fade-out laten starten laatste 500ms (optioneel, mag je weglaten)
    const fadeTimeout = setTimeout(() => setFade(true), duration - 500);
    // Stop en clean-up na duration
    const stopTimeout = setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      setFade(false);
    }, duration);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(stopTimeout);
      cancelAnimationFrame(animationFrame);
      setFade(false);
    };
  }, [active, duration]);

  // canvas altijd op top van layout
  return active ? (
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
  ) : null;
};

export default Confetti;
