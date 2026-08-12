"use client";

import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import Image from "next/image";
import { Magnetic } from "@/components/ui/magnetic-button";
import { CursorTarget } from "@/components/providers/cursor-provider";

export function Hero() {
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(imageRef.current, {
        yPercent: 18,
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
      {/* Hero photography, parallaxed slightly slower than scroll */}
      <div ref={imageRef} className="absolute inset-0 -top-[10%] h-[120%] w-full">
        <Image
          src="/images/hero-building.jpg"
          alt="Meridian residential tower at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Legibility gradient over the photo */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,12,0.55)_0%,rgba(11,13,12,0.35)_35%,rgba(11,13,12,0.85)_100%)]" />
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

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
