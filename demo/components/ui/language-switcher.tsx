"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          <button
            onClick={() => router.replace(pathname, { locale: loc })}
            disabled={loc === locale}
            className={
              loc === locale ? "text-cream" : "text-cream-dim transition-colors hover:text-clay"
            }
          >
            {loc}
          </button>
          {i < routing.locales.length - 1 && <span className="text-cream-dim/40">/</span>}
        </span>
      ))}
    </div>
  );
}
