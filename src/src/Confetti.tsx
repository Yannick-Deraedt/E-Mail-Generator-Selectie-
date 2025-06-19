import { useRef, useEffect } from "react";

type ConfettiProps = {
  active: boolean;
  duration?: number;
};

const COLORS = ["#f6d743", "#2db4e7", "#5fd37e", "#fd5b78", "#fff", "#9966cc", "#fa7921"];

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

export default function Confetti({ active, duration = 5000 }: ConfettiProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const anim = useRef<number>();

  useEffect(() => {
    let running = true;
    const canvas = ref.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = typeof window !== "undefined" ? window.innerWidth : 1280;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;
    const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const confetti = Array.from({ length: 140 }).map(() => ({
      x: randomBetween(0, width),
      y: randomBetween(-100, height / 2),
      r: randomBetween(7, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: randomBetween(0, Math.PI * 2),
      speed: randomBetween(2, 6),
      swing: randomBetween(0.8, 2.4),
      swingPhase: Math.random() * Math.PI * 2,
    }));

    const startTime = Date.now();

    function draw() {
      if (!running || !ctx || !canvas) return;
      const elapsed = Date.now() - startTime;
      let alpha = 0.82;

      // FADE-OUT: laatste seconde wordt alpha minder
      if (duration > 0 && elapsed > duration - 1000) {
        alpha = Math.max(0, 0.82 * (1 - (elapsed - (duration - 1000)) / 1000));
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of confetti) {
        p.y += p.speed;
        p.x += Math.sin(p.y / 30 + p.swingPhase) * p.swing; // heen-en-weer
        if (p.y > height + 20) {
          p.y = -10;
          p.x = randomBetween(0, width);
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.restore();
      }
      anim.current = window.requestAnimationFrame(draw);
    }

    draw();

    // FIX: Correct type for timer!
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (duration > 0) {
      timer = setTimeout(() => {
        running = false;
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, duration);
    }
    return () => {
      running = false;
      if (anim.current) window.cancelAnimationFrame(anim.current);
      if (timer) clearTimeout(timer);
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      width={typeof window !== "undefined" ? window.innerWidth : 1280}
      height={typeof window !== "undefined" ? window.innerHeight : 800}
      aria-hidden
    />
  );
}
