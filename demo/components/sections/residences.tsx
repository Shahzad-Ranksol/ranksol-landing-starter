"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { units, type Availability } from "@/lib/data/units";
import { tierInfo, type Tier } from "@/lib/data/floors";
import { Reveal } from "@/components/ui/reveal";
import { CursorTarget } from "@/components/providers/cursor-provider";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const tierByLabel: Record<string, Tier> = Object.fromEntries(
  (Object.keys(tierInfo) as Tier[]).map((tier) => [tierInfo[tier].label, tier])
);

const availabilityStyle: Record<Availability, string> = {
  available: "text-clay border-clay/50",
  reserved: "text-cream-dim border-ink-line",
  sold: "text-cream-dim/50 border-ink-line",
};

export function Residences() {
  const t = useTranslations("residences");
  const [filter, setFilter] = useState<string>("all");

  const tiers = Object.values(tierInfo).map((v) => v.label);
  const filtered = useMemo(
    () => (filter === "all" ? units : units.filter((u) => u.tierLabel === filter)),
    [filter]
  );

  const availabilityLabel: Record<Availability, string> = {
    available: t("available"),
    reserved: t("reserved"),
    sold: t("sold"),
  };

  return (
    <section id="residences" className="border-t border-ink-line bg-ink px-6 py-28 md:px-12">
      <Reveal className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">{t("title")}</h2>
        </div>
        <p className="max-w-sm text-cream-dim">{t("body")}</p>
      </Reveal>

      <div className="mb-8 flex flex-wrap gap-2">
        {["all", ...tiers].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              filter === f
                ? "border-clay bg-clay text-ink"
                : "border-ink-line text-cream-dim hover:border-cream/40 hover:text-cream"
            }`}
          >
            {f === "all" ? t("filterAll") : f.replace(" Collection", "")}
          </button>
        ))}
      </div>

      <div className="grid gap-px overflow-hidden border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((unit, i) => (
          <Reveal key={unit.id} delay={(i % 4) * 0.05} className="bg-ink p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg text-cream">{unit.number}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-cream-dim">
                  {unit.floorLabel} · {tierByLabel[unit.tierLabel]}
                </p>
              </div>
              <span
                className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${availabilityStyle[unit.availability]}`}
              >
                {availabilityLabel[unit.availability]}
              </span>
            </div>

            <dl className="mt-5 space-y-2 border-t border-ink-line pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-cream-dim">{t("area")}</dt>
                <dd className="text-cream">{unit.sizeSqm} m²</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream-dim">{t("configuration")}</dt>
                <dd className="text-cream">
                  {unit.bedrooms} bd · {unit.bathrooms} ba
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream-dim">{t("view")}</dt>
                <dd className="text-right text-cream">{unit.view}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-ink-line pt-4">
              <span className="font-display text-lg text-cream">{currency.format(unit.price)}</span>
              <CursorTarget label="View">
                <a href="#contact" className="font-mono text-[10px] uppercase tracking-widest text-clay">
                  {t("details")} ↗
                </a>
              </CursorTarget>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
