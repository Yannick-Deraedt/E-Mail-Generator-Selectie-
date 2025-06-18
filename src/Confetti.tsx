import { useEffect, useRef } from "react";

export default function Confetti({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const count = 24;
    const colors = ["#39aafc", "#78c6ff", "#142c54", "#fff", "#f7cf00", "#d8f0ff"];
    const parent = ref.current;
    if (!parent) return;
    parent.innerHTML = "";
    for (let i = 0; i < count; ++i) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.top = "40%";
      el.style.left = Math.random() * 90 + "%";
      el.style.width = "10px";
      el.style.height = "16px";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = "2px";
      el.style.opacity = "0.78";
      el.style.transform = `translateY(0) rotate(${Math.random() * 40 - 20}deg)`;
      el.animate([
        { transform: `translateY(0) rotate(${Math.random() * 40 - 20}deg)`, opacity: 0.8 },
        { transform: `translateY(200px) rotate(${Math.random() * 180 - 90}deg)`, opacity: 0 }
      ], {
        duration: 900 + Math.random() * 400,
        delay: i * 20,
        easing: "ease-out"
      });
      parent.appendChild(el);
    }
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
