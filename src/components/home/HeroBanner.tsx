"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";

export function HeroBanner() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative isolate h-[560px] w-full overflow-hidden bg-primary-900 lg:h-[480px]" aria-labelledby="hero-title">
      <picture className="absolute inset-0 -z-10 block">
        <source media="(max-width: 767px)" srcSet="/hero-section_mobile.png" />
        <img
          src="/hero_section.jpeg"
          alt="Sélection de produits caribéens Lucian Connection"
          className="h-full w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary-950/90 via-primary-950/55 to-transparent md:via-primary-950/35" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="flex max-w-[420px] flex-col items-start gap-5 text-left text-white">
          <p className="font-mono text-xs font-semibold tracking-[0.18em] text-accent uppercase">
            {t("eyebrow")}
          </p>
          <div className="h-px w-12 bg-accent" aria-hidden="true" />
          <h1 id="hero-title" className="font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
            {t("subtitle")}
          </p>
          <Link href="/products" className="mt-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <Button variant="accent" size="lg" className="font-semibold">
              {t("cta")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
