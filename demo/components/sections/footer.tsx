import { useTranslations } from "next-intl";

const SKILLS = [
  "nextjs-app-scaffold",
  "scroll-animation",
  "r3f-3d-viewer",
  "i18n-nextintl",
  "interactive-map",
  "cms-content-model",
  "perf-web",
  "cursor-interactions",
];

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-ink-line bg-ink px-6 py-16 md:px-12">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-xl text-cream">MERIDIAN</p>
          <p className="mt-3 max-w-md text-sm text-cream-dim">{t("tagline")}</p>
        </div>
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-cream-dim">
            {t("skills")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <li
                key={s}
                className="border border-ink-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cream-dim"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12 flex flex-col justify-between gap-2 border-t border-ink-line pt-6 font-mono text-[10px] uppercase tracking-widest text-cream-dim md:flex-row">
        <span>© 2026 Meridian — {t("rights")}</span>
        <span>ranksol-landing-starter</span>
      </div>
    </footer>
  );
}
