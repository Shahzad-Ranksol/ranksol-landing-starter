"use client";

import { useRef } from "react";
import gsap from "gsap";

/** Wrap any element (button, Link, div) to give it magnetic-pull-toward-cursor hover. */
export function Magnetic({
  children,
  className = "",
  strength = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        gsap.to(el, { x, y, duration: 0.3, ease: "power2.out" });
      }}
      onMouseLeave={() => {
        gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      }}
    >
      {children}
    </div>
  );
}
