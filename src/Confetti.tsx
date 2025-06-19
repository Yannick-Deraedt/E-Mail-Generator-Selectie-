import { useEffect, useRef } from "react";

type ConfettiProps = {
  active: boolean;
  duration?: number; // in ms
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
  duration = 7000,   // standaard 7 seconden
  amount = 200         // véél snippers
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animation = useRef<number>();
  const fadeTimeout = useRef<number>();
  const fadeStep = 0.012; // voor fade-out (kleiner = trager fade)

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

    let fade = 1;
    let fading = false;

    // Snipper confetti
    let confetti = Array.from({ length: amount }, () => ({
      x: random(0, width),
      y: random(-height, 0),
      w: random(6, 15),
      h: random(10, 26),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      tilt: random(-0.5, 0.5),
      tiltAngle: random(0, 2 * Math.PI),
      tiltAngleIncrement: random(0.02, 0.08),
      dx: random(-1.1, 1.1),
      dy: random(2.2, 4.6),
    }));

    function drawConfetti() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = fade;
      for (let i = 0; i < confetti.length; i++) {
        let c = confetti[i];
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.tiltAngle);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    function animateConfetti() {
      for (let i = 0; i < confetti.length; i++) {
        let c = confetti[i];
        c.x += c.dx + Math.sin(Date.now() / 850 + i) * 0.9;
        c.y += c.dy + Math.cos(Date.now() / 700 + i) * 0.5;
        c.tiltAngle += c.tiltAngleIncrement;

        // Stuitert van links naar rechts
        if (c.x < 0) c.x = width;
        if (c.x > width) c.x = 0;

        // Komt opnieuw bovenin als onderaan uit beeld
        if (c.y > height + 24) {
          c.x = random(0, width);
          c.y = random(-40, 0);
        }
      }
      drawConfetti();

      if (!fading) animation.current = requestAnimationFrame(animateConfetti);
      else if (fade > 0) {
        fade -= fadeStep;
        drawConfetti();
        animation.current = requestAnimationFrame(animateConfetti);
      }
    }

    animation.current = requestAnimationFrame(animateConfetti);

    // Start fade-out na de duration
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
