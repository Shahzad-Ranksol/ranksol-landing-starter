"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";

export function About() {
  const t = useTranslations("about");

  const stats = [
    { value: "12", label: t("statLevels") },
    { value: "31", label: t("statUnits") },
    { value: "78%", label: t("statTerraces") },
  ];

  return (
    <section id="about" className="border-t border-ink-line bg-ink px-6 py-28 md:px-12">
      <div className="grid gap-12 md:grid-cols-2 md:gap-24">
        <Reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">{t("title")}</h2>
        </Reveal>
        <div>
          <Reveal>
            <p className="text-cream-dim">{t("body1")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-cream-dim">{t("body2")}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-ink-line pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl text-clay md:text-4xl">{s.value}</dt>
                  <dd className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream-dim">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
