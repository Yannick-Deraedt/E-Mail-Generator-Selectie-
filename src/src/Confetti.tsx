import { useRef, useEffect } from "react";

type ConfettiProps = {
  active: boolean;
  duration?: number;
};

const COLORS = ["#f6d743", "#2db4e7", "#5fd37e", "#fd5b78", "#fff", "#9966cc", "#fa7921"];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ active, duration = 5000 }: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const anim = useRef<number>();

  useEffect(() => {
    let running = true;
    const canvas = ref.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Confetti partjes
    const confetti = Array.from({ length: 140 }).map(() => ({
      x: randomBetween(0, window.innerWidth),
      y: randomBetween(-100, window.innerHeight / 2),
      r: randomBetween(7, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: randomBetween(0, Math.PI * 2),
      speed: randomBetween(2, 6),
      swing: randomBetween(0.8, 2.4), // geeft een kleine zigzag/heen-en-weer beweging
      swingPhase: Math.random() * Math.PI * 2
    }));

    function draw() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of confetti) {
        p.y += p.speed;
        // Verticale zigzag
        p.x += Math.sin(p.y / 30 + p.swingPhase) * p.swing;
        // Herbegin bovenaan als onderaan uit beeld
        if (p.y > window.innerHeight + 20) {
          p.y = -10;
          p.x = randomBetween(0, window.innerWidth);
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.82;
        ctx.fill();
        ctx.restore();
      }
      anim.current = requestAnimationFrame(draw);
    }

    draw();

    let timer: NodeJS.Timeout;
    if (duration > 0) {
      timer = setTimeout(() => {
        running = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, duration);
    }
    return () => {
      running = false;
      cancelAnimationFrame(anim.current!);
      if (timer) clearTimeout(timer);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, duration]);

  return (
    <canvas
      ref={ref}
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: active ? "block" : "none"
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden
    />
  );
}
