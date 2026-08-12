"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

/**
 * Deliberately decoupled from real asset load progress — a slow real progress bar was the
 * #1 issue found reviewing a build made with this same skill set. This tween always
 * completes in ~1.8s regardless of what's still loading behind it.
 */
export function Preloader({ label }: { label: string }) {
  const [done, setDone] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const obj = useRef({ val: 0 });

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(rootRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "power3.inOut",
          delay: 0.15,
          onComplete: () => setDone(true),
        });
      },
    });
    tl.to(obj.current, {
      val: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) counterRef.current.textContent = String(Math.floor(obj.current.val));
        if (barRef.current) barRef.current.style.width = `${obj.current.val}%`;
      },
    });
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[998] flex flex-col justify-between bg-ink px-6 py-8 md:px-12 md:py-10"
    >
      <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-cream-dim">
        <span>Meridian</span>
      </div>
      <div>
        <span
          ref={counterRef}
          className="font-display text-[18vw] leading-none text-cream md:text-[12vw]"
        >
          0
        </span>
        <span className="font-display text-[18vw] leading-none text-clay md:text-[12vw]">%</span>
        <div className="mt-6 h-px w-full bg-ink-line">
          <div ref={barRef} className="h-px w-0 bg-clay" />
        </div>
      </div>
      <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-widest text-cream-dim">
        <span>{label}</span>
        <span>Please wait</span>
      </div>
    </div>
  );
}
