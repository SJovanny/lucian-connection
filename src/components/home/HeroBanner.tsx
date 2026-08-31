"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";

export function HeroBanner() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative isolate min-h-[560px] w-full overflow-hidden bg-primary-900 lg:min-h-[480px]" aria-labelledby="hero-title">
      <picture className="absolute inset-0 -z-10 block">
        <source media="(max-width: 767px)" srcSet="/hero-section_mobile.png" />
        <img
          src="/hero_section.jpeg"
          alt="Sélection de produits caribéens Lucian Connection"
          className="h-full w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary-950/90 via-primary-950/55 to-transparent md:via-primary-950/35" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-7xl items-center px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[480px] lg:items-end lg:px-12 lg:py-14">
        <div className="flex max-w-[500px] flex-col items-start text-left text-white">
          <div className="border-l-2 border-accent pl-4">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
              {t("eyebrow")}
            </p>
            <h1 id="hero-title" className="mt-3 font-display text-3xl font-bold leading-[1.08] text-balance sm:text-4xl lg:text-5xl">
              {t("titleBefore")}
              <span className="text-primary-300">{t("titleHighlight")}</span>
              {t("titleAfter")}
            </h1>
          </div>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white sm:text-lg">
            {t("subtitle")}
          </p>
          <Link href="/products" className="mt-6 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <Button variant="accent" size="lg" className="font-semibold">
              {t("cta")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
