"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

export function HeroBanner() {
  const t = useTranslations("home.hero");

  return (
    <section
      aria-label={t("title")}
      className="relative mb-12 overflow-hidden grain-overlay"
      style={{ backgroundColor: "var(--color-island-forest-deep)" }}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src="/saint-lucia-hero.png"
          alt="A Saint Lucian seller with a basket of fresh produce in front of the twin Pitons at golden hour"
          className="h-full w-full object-cover object-[75%_top] animate-hero-zoom"
        />
      </div>

      {/* Cinematic readability gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-island-forest-deep) 0%, rgba(16,34,25,0.82) 38%, rgba(16,34,25,0.35) 62%, rgba(16,34,25,0) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(0deg, var(--color-island-forest-deep) 0%, rgba(16,34,25,0) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:min-h-[66vh] lg:px-8">
        <div className="max-w-2xl">
          <p
            className="animate-hero-rise mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: "var(--color-island-sand)", animationDelay: "0.05s" }}
          >
            <span
              className="h-px w-10"
              style={{ backgroundColor: "var(--color-island-sand)" }}
            />
            {t("eyebrow")}
          </p>

          <h1
            className="animate-hero-rise font-serif text-5xl font-bold leading-[0.98] text-balance sm:text-6xl lg:text-7xl xl:text-8xl"
            style={{ color: "var(--color-island-cream)", animationDelay: "0.15s" }}
          >
            {t("title")}
          </h1>

          <p
            className="animate-hero-rise mt-7 max-w-md text-lg leading-relaxed text-pretty sm:text-xl"
            style={{ color: "rgba(245,239,230,0.82)", animationDelay: "0.3s" }}
          >
            {t("subtitle")}
          </p>

          <div
            className="animate-hero-rise mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              href="/products"
              className="btn-press group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-xl transition-all duration-200 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: "var(--color-island-coral)",
                color: "var(--color-island-cream)",
              }}
            >
              {t("cta")}
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border px-7 py-4 text-base font-medium backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: "rgba(245,239,230,0.35)",
                color: "var(--color-island-cream)",
              }}
            >
              {t("secondaryCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
