"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { tierInfo, type Tier } from "@/lib/data/floors";
import { getTierSummary } from "@/lib/data/units";
import { Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic-button";

const BuildingScene = dynamic(
  () => import("@/components/three/building-scene").then((m) => m.BuildingScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-widest text-cream-dim">
        Loading model…
      </div>
    ),
  }
);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact",
});

export function Tour3D() {
  const t = useTranslations("tour3d");
  const [selectedTier, setSelectedTier] = useState<Tier | null>("crown");
  const [hoveredTier, setHoveredTier] = useState<Tier | null>(null);

  const activeTier = hoveredTier ?? selectedTier;
  const summary = activeTier ? getTierSummary(tierInfo[activeTier].label) : null;

  return (
    <section id="tour3d" className="border-t border-ink-line bg-ink px-6 py-28 md:px-12">
      <Reveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">{t("title")}</h2>
        </div>
        <p className="max-w-sm text-cream-dim">{t("body")}</p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden border border-ink-line bg-ink-soft md:aspect-[16/9]">
          <div className="absolute left-4 top-4 z-10 font-mono text-[10px] uppercase tracking-widest text-cream-dim">
            {t("hint")}
          </div>
          <BuildingScene
            selectedTier={selectedTier}
            hoveredTier={hoveredTier}
            onSelect={setSelectedTier}
            onHover={setHoveredTier}
          />
        </div>

        <div className="border border-ink-line bg-ink-soft p-6">
          <div className="flex items-center justify-between border-b border-ink-line pb-4 font-mono text-xs uppercase tracking-widest text-cream-dim">
            <span>{t("levelDetails")}</span>
            <span className="text-clay">{activeTier ? tierInfo[activeTier].label.split(" ")[0] : "—"}</span>
          </div>

          {activeTier && summary ? (
            <div className="pt-4">
              <p className="font-display text-2xl text-cream">{tierInfo[activeTier].label}</p>
              <p className="mt-1 text-sm text-cream-dim">{tierInfo[activeTier].blurb}</p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="border border-ink-line p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim">{t("units")}</p>
                  <p className="mt-1 font-display text-xl text-cream">{summary.unitCount}</p>
                </div>
                <div className="border border-ink-line p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim">
                    {t("availability")}
                  </p>
                  <p className="mt-1 font-display text-xl text-clay">{summary.available}</p>
                </div>
              </div>

              {summary.minPrice && (
                <div className="mt-4 border border-ink-line p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim">
                    {t("pricing")}
                  </p>
                  <p className="mt-1 font-display text-xl text-cream">
                    {currency.format(summary.minPrice)} – {currency.format(summary.maxPrice ?? 0)}
                  </p>
                </div>
              )}

              <Magnetic className="mt-6 inline-block">
                <a
                  href="#residences"
                  className="inline-block border border-clay/60 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-clay transition-colors hover:bg-clay hover:text-ink"
                >
                  {t("viewUnits")}
                </a>
              </Magnetic>
            </div>
          ) : (
            <p className="pt-6 text-sm text-cream-dim">{t("hint")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
