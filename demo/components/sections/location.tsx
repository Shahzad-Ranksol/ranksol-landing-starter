"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { pois, poiCategoryLabel } from "@/lib/data/pois";
import { Reveal } from "@/components/ui/reveal";
import { CursorTarget } from "@/components/providers/cursor-provider";

export function Location() {
  const t = useTranslations("location");
  const [active, setActive] = useState<string | null>(null);

  const filtered = pois;
  const activePoi = useMemo(() => pois.find((p) => p.id === active) ?? null, [active]);

  return (
    <section id="location" className="border-t border-ink-line bg-ink px-6 py-28 md:px-12">
      <Reveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">{t("title")}</h2>
        </div>
        <p className="max-w-sm text-cream-dim">{t("body")}</p>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="border border-ink-line bg-ink-soft">
          <div className="border-b border-ink-line p-4 font-mono text-xs uppercase tracking-widest text-cream-dim">
            {t("allPois")}
          </div>
          <ul className="max-h-[420px] overflow-y-auto">
            {filtered.map((poi) => (
              <li key={poi.id} className="border-b border-ink-line last:border-b-0">
                <CursorTarget label="Locate">
                  <button
                    onMouseEnter={() => setActive(poi.id)}
                    onMouseLeave={() => setActive(null)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                      active === poi.id ? "bg-clay-soft" : ""
                    }`}
                  >
                    <span>
                      <span className="block text-cream">{poi.name}</span>
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-cream-dim">
                        {poiCategoryLabel[poi.category]}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-mono text-xs text-clay">
                      {poi.walkMinutes}m {t("walk")}
                    </span>
                  </button>
                </CursorTarget>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-square overflow-hidden border border-ink-line bg-ink-soft sm:aspect-[4/3]">
          <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="#f4eee4" strokeWidth={1} />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="#f4eee4" strokeWidth={1} />
            ))}
          </svg>

          {/* Site marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute h-4 w-4 animate-ping rounded-full bg-clay/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-clay" />
            </div>
            <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-cream">
              Meridian
            </span>
          </div>

          {pois.map((poi) => (
            <div
              key={poi.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
              style={{ left: `${poi.x}%`, top: `${poi.y}%`, transform: active === poi.id ? "scale(1.4)" : undefined }}
            >
              <span
                className={`block h-2 w-2 rounded-full ${active === poi.id ? "bg-clay" : "bg-cream-dim"}`}
              />
            </div>
          ))}

          {activePoi && (
            <div className="absolute bottom-4 left-4 right-4 border border-ink-line bg-ink/90 p-4 backdrop-blur-sm">
              <p className="font-display text-lg text-cream">{activePoi.name}</p>
              <p className="mt-1 font-mono text-xs text-cream-dim">
                {activePoi.walkMinutes} min {t("walk")} · {activePoi.driveMinutes} min {t("drive")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
