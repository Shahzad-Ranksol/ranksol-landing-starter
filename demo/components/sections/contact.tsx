"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { Magnetic } from "@/components/ui/magnetic-button";
import { CursorTarget } from "@/components/providers/cursor-provider";

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-cream-dim">
        {label}
      </span>
      <input
        {...props}
        className="w-full border border-ink-line bg-transparent px-4 py-3 text-cream outline-none transition-colors focus:border-clay"
      />
    </label>
  );
}

export function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="border-t border-ink-line bg-ink-soft px-6 py-28 md:px-12">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
          <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">{t("title")}</h2>
          <p className="mt-4 max-w-sm text-cream-dim">{t("body")}</p>
          <p className="mt-8 border-l-2 border-clay/50 pl-4 text-xs text-cream-dim">{t("demoNotice")}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-5 border border-ink-line bg-ink p-6 sm:grid-cols-2 md:p-8"
          >
            <Field label={t("name")} type="text" placeholder="Jane Doe" />
            <Field label={t("email")} type="email" placeholder="jane@email.com" />
            <Field label={t("phone")} type="tel" placeholder="+1 555 000 0000" />
            <Field label={t("unitPreference")} type="text" placeholder="Summit Collection" />

            <label className="block sm:col-span-2">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-cream-dim">
                {t("message")}
              </span>
              <textarea
                rows={4}
                placeholder={t("messagePlaceholder")}
                className="w-full resize-none border border-ink-line bg-transparent px-4 py-3 text-cream outline-none transition-colors focus:border-clay"
              />
            </label>

            <label className="flex items-start gap-3 sm:col-span-2">
              <input type="checkbox" className="mt-1 h-4 w-4 border-ink-line bg-transparent accent-clay" />
              <span className="text-xs text-cream-dim">{t("consent")}</span>
            </label>

            <div className="sm:col-span-2">
              <CursorTarget label="Send">
                <Magnetic className="inline-block w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full border border-clay bg-clay px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 sm:w-auto"
                  >
                    {t("submit")}
                  </button>
                </Magnetic>
              </CursorTarget>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
