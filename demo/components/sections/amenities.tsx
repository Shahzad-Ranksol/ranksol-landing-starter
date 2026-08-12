"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { amenities, type Amenity } from "@/lib/data/amenities";
import { Reveal } from "@/components/ui/reveal";

const featured = amenities.find((a) => a.id === "aurora-pool")!;
const rest = amenities.filter((a) => a.id !== "aurora-pool");

const icons: Record<Amenity["icon"], React.ReactNode> = {
  pool: (
    <path d="M3 16c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0M6 8h12M8 4h8v8H8z" />
  ),
  spa: <path d="M12 3c2 3 4 5 4 8a4 4 0 1 1-8 0c0-3 2-5 4-8ZM6 21c1-3 3-4 6-4s5 1 6 4" />,
  work: <path d="M4 7h16v11H4zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 12h16" />,
  garden: <path d="M12 21v-9M12 12c-4 0-6-2-6-6 4 0 6 2 6 6ZM12 12c4 0 6-2 6-6-4 0-6 2-6 6Z" />,
  kitchen: <path d="M5 3v18M19 3v6a2 2 0 0 1-2 2h-1M19 21V9M5 8h4" />,
  screen: <path d="M3 5h18v11H3zM8 21h8M12 16v5" />,
  garage: <path d="M4 10 12 4l8 6v10H4Zm3 10v-6h10v6" />,
  pet: <path d="M12 15c3 0 5 2 5 4H7c0-2 2-4 5-4ZM6 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
};

export function Amenities() {
  const t = useTranslations("amenities");

  return (
    <section id="amenities" className="border-t border-ink-line bg-ink-soft px-6 py-28 md:px-12">
      <Reveal className="mb-14 max-w-2xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-clay">{t("eyebrow")}</p>
        <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">{t("title")}</h2>
        <p className="mt-4 text-cream-dim">{t("body")}</p>
      </Reveal>

      <Reveal className="relative mb-px aspect-[16/9] overflow-hidden border border-ink-line md:aspect-[21/9]">
        <Image
          src="/images/amenity-pool.jpg"
          alt={featured.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-clay">{featured.level}</p>
          <p className="mt-1 font-display text-2xl text-cream md:text-3xl">{featured.name}</p>
          <p className="mt-2 max-w-md text-sm text-cream-dim">{featured.description}</p>
        </div>
      </Reveal>

      <div className="grid gap-px overflow-hidden border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((amenity, i) => (
          <Reveal key={amenity.id} delay={(i % 3) * 0.06} className="group bg-ink-soft p-7">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-clay transition-transform duration-300 group-hover:scale-110"
            >
              {icons[amenity.icon]}
            </svg>
            <p className="mt-5 font-display text-xl text-cream">{amenity.name}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream-dim">
              {amenity.level}
            </p>
            <p className="mt-3 text-sm text-cream-dim">{amenity.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
