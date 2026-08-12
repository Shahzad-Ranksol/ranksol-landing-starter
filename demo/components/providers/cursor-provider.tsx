"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import gsap from "gsap";

type CursorContextValue = {
  setLabel: (label: string | null) => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CursorProvider");
  return ctx;
}

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const active = fine && !reduced;
    document.documentElement.classList.toggle("has-custom-cursor", active);
    if (!active || !dotRef.current) return;

    setEnabled(true);

    const moveX = gsap.quickTo(dotRef.current, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(dotRef.current, "y", { duration: 0.35, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      moveX(e.clientX);
      moveY(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <CursorContext.Provider value={{ setLabel }}>
      {children}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[999] -translate-x-1/2 -translate-y-1/2 ${
          enabled ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`flex items-center justify-center rounded-full border border-cream/40 bg-ink/70 backdrop-blur-sm transition-all duration-200 ${
            label ? "h-16 w-16" : "h-3 w-3 border-clay bg-clay"
          }`}
        >
          {label && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream">
              {label}
            </span>
          )}
        </div>
      </div>
    </CursorContext.Provider>
  );
}

/** Wrap any element to set the cursor label on hover; clears on unmount/leave. */
export function CursorTarget({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setLabel } = useCursor();
  return (
    <div
      className={className}
      onMouseEnter={() => setLabel(label)}
      onMouseLeave={() => setLabel(null)}
    >
      {children}
    </div>
  );
}
