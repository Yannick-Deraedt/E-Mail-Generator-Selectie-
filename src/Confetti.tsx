import { useEffect, useRef } from "react";

type ConfettiProps = {
  active: boolean;
  duration?: number;
  amount?: number;
};

const COLORS = [
  "#FFDF6C", "#87E6C5", "#FF6F91", "#6A89CC", "#F6C6EA", "#45AAF2",
  "#FF7F50", "#FFD93D", "#4BCFFA", "#F78FB3", "#A8E063", "#E17055"
];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({
  active,
  duration = 7000,      // <<---- standaard 7 seconden
  amount = 250           // <<---- aantal confettideeltjes
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animation = useRef<number>();
  const fadeTimeout = useRef<number>();

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Maak véél meer confetti
    let confetti = Array.from({ length: amount }, () => ({
      x: random(0, width),
      y: random(-height, 0),
      r: random(6, 15),
      d: random(15, 37),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      tilt: random(-15, 15),
      tiltAngle: random(0, 2 * Math.PI),
      tiltAngleIncrement: random(0.03, 0.08),
      wave: random(0, 2 * Math.PI),
    }));

    let fade = 1;
    let fading = false;

    function drawConfetti() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = fade;
      for (let i = 0; i < confetti.length; i++) {
        let c = confetti[i];
        ctx.beginPath();
        ctx.ellipse(
          c.x + Math.sin(c.wave) * 20,
          c.y,
          c.r,
          c.r * 0.55,
          c.tilt,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = c.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function animateConfetti() {
      for (let i = 0; i < confetti.length; i++) {
        let c = confetti[i];
        c.y += Math.cos(c.wave) + c.d / 17;
        c.x += Math.sin(Date.now() / 370 + c.wave) * 2.1;
        c.wave += 0.014;
        c.tiltAngle += c.tiltAngleIncrement;
        c.tilt = Math.sin(c.tiltAngle) * 14;

        // Opnieuw bovenaan als beneden uit beeld
        if (c.y > height + 20) {
          c.x = random(0, width);
          c.y = random(-30, 0);
        }
      }
      drawConfetti();

      if (!fading) animation.current = requestAnimationFrame(animateConfetti);
      else if (fade > 0) {
        fade -= 0.014;   // <<--- fade snelheid (lager = langzamer, dus langer zichtbaar)
        drawConfetti();
        animation.current = requestAnimationFrame(animateConfetti);
      }
    }

    animation.current = requestAnimationFrame(animateConfetti);

    // Start fade na x seconden
    fadeTimeout.current = window.setTimeout(() => {
      fading = true;
    }, duration);

    return () => {
      if (animation.current) cancelAnimationFrame(animation.current);
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, [active, duration, amount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        zIndex: 10000,
        pointerEvents: "none",
        display: active ? "block" : "none"
      }}
    />
  );
}
