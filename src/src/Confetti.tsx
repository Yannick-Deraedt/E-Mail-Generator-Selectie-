import { useEffect, useRef } from "react";

export default function Confetti({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      if (ref.current) ref.current.innerHTML = "";
      return;
    }
    const count = 80;
    const colors = [
      "#1c397a", "#2978e7", "#63c5ff", "#6ec4e8", "#e8f6ff", "#f7cf00", "#fff", "#56b6f7", "#3eaaff"
    ];
    const parent = ref.current;
    if (!parent) return;
    parent.innerHTML = "";
    for (let i = 0; i < count; ++i) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.top = "-32px";
      el.style.left = Math.random() * 96 + "%";
      el.style.width = 14 + Math.random() * 12 + "px";
      el.style.height = 18 + Math.random() * 16 + "px";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = "4px";
      el.style.opacity = "0.89";
      el.style.transform = `translateY(0) rotate(${Math.random() * 90 - 45}deg)`;
      el.style.boxShadow = `0 1px 6px #0002`;
      el.animate([
        { transform: `translateY(0) rotate(${Math.random() * 60 - 30}deg)`, opacity: 0.92 },
        { transform: `translateY(${340 + Math.random() * 240}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0 }
      ], {
        duration: 2100 + Math.random() * 800,
        delay: Math.random() * 220,
        easing: "ease-in"
      });
      parent.appendChild(el);
    }
    // Maak automatisch leeg na 2,7s
    const timeout = setTimeout(() => { if (ref.current) ref.current.innerHTML = ""; }, 2700);
    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <div ref={ref} style={{
      pointerEvents: "none",
      position: "fixed",
      left: 0, top: 0, width: "100vw", height: "100vh",
      zIndex: 20000
    }}></div>
  );
}
