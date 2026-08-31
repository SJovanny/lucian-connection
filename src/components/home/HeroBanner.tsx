/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";

export function HeroBanner() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative bg-primary-600 rounded-2xl overflow-hidden mb-8 grain-overlay">
      {/* Background pattern - organic dots with slight variation */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grocery-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="currentColor" />
            <circle cx="5" cy="15" r="1" fill="currentColor" opacity="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grocery-pattern)" />
        </svg>
      </div>

      <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12 z-10">
        {/* Left content */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white font-display leading-tight mb-4 heading-display">
            {t("title")}
          </h1>
          <p className="text-white/90 text-lg mb-8 max-w-md leading-relaxed">
            {t("subtitle")}
          </p>
          <div>
            <Link href="/products">
              <Button variant="accent" size="lg" className="font-semibold">
                {t("cta")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Right content - Illustration */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Background shape */}
            <div className="absolute inset-0 bg-primary-500 rounded-3xl transform rotate-6" />
            {/* Image container */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img
                src="/hero_section.jpeg"
                alt="Produits frais"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-50">
        <svg
          className="absolute bottom-full w-full h-6 text-gray-50"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
