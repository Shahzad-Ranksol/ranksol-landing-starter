"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { CursorTarget } from "@/components/providers/cursor-provider";

export function Nav() {
  const t = useTranslations("nav");

  const links: { href: string; label: string }[] = [
    { href: "#about", label: t("overview") },
    { href: "#residences", label: t("residences") },
    { href: "#tour3d", label: t("tour3d") },
    { href: "#amenities", label: t("amenities") },
    { href: "#location", label: t("location") },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12">
      <Link href="/" className="font-display text-lg tracking-wide text-cream">
        MERIDIAN
      </Link>
      <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-cream-dim lg:flex">
        {links.map((link) => (
          <CursorTarget key={link.href} label="View">
            <a href={link.href} className="transition-colors hover:text-cream">
              {link.label}
            </a>
          </CursorTarget>
        ))}
      </nav>
      <div className="flex items-center gap-6">
        <LanguageSwitcher />
        <CursorTarget label="Go">
          <a
            href="#contact"
            className="hidden border border-clay/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-clay transition-colors hover:bg-clay hover:text-ink md:block"
          >
            {t("inquire")}
          </a>
        </CursorTarget>
      </div>
    </header>
  );
}
