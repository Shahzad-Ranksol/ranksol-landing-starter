"use client";

import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Magnetic } from "@/components/ui/magnetic-button";
import { CursorTarget } from "@/components/providers/cursor-provider";

/** Procedural skyline silhouette — original generated shapes, no external imagery. */
function Skyline({ className, seed }: { className?: string; seed: number }) {
  const bars = Array.from({ length: 14 }, (_, i) => {
    const h = 20 + ((i * 37 + seed * 53) % 60);
    const w = 4 + ((i * 17 + seed) % 5);
    return { h, w, x: i * 7 };
  });
  return (
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={60 - b.h} width={b.w} height={b.h} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(farRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(nearRef.current, {
        yPercent: -45,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 2.0,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative flex h-screen items-end overflow-hidden bg-ink">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#3a2418_0%,#14120e_55%,#0b0d0c_100%)]" />
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Parallax skyline layers */}
      <div ref={farRef} className="absolute inset-x-0 bottom-0 h-[40vh] text-ink-soft/80">
        <Skyline seed={2} className="h-full w-full" />
      </div>
      <div ref={nearRef} className="absolute inset-x-0 bottom-0 h-[32vh] text-ink">
        <Skyline seed={7} className="h-full w-full" />
      </div>

      <div className="relative z-10 w-full px-6 pb-24 md:px-12 md:pb-32">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
        <div ref={titleRef}>
          <h1 className="font-display text-[13vw] leading-[0.95] text-cream md:text-[7.5vw]">
            {t("titleLine1")}
            <br />
            <span className="italic text-clay">{t("titleLine2")}</span>
          </h1>
        </div>
        <div className="mt-8 flex max-w-xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-sm text-cream-dim">{t("sub")}</p>
          <CursorTarget label="Explore">
            <Magnetic>
              <a
                href="#residences"
                className="inline-block whitespace-nowrap border border-cream/30 px-6 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-clay hover:text-clay"
              >
                {t("cta")}
              </a>
            </Magnetic>
          </CursorTarget>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cream-dim">
        <span>{t("scrollHint")}</span>
        <span className="h-6 w-px animate-pulse bg-cream-dim" />
      </div>
    </section>
  );
}
