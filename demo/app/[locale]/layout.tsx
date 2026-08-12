import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { CursorProvider } from "@/components/providers/cursor-provider";
import "../globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: {
    default: "Meridian | Skill Demo — Ranksol Landing Starter",
    template: "%s | Meridian",
  },
  description:
    "A fictional showcase property demonstrating the ranksol-landing-starter Claude Code skill set: scroll choreography, a 3D residence viewer, i18n, custom cursor, and more.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-ink font-sans text-cream antialiased">
        <NextIntlClientProvider>
          <LenisProvider>
            <CursorProvider>{children}</CursorProvider>
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
