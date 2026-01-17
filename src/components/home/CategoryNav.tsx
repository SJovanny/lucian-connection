"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Category } from "@/types/database.types";
import { Locale } from "@/i18n/routing";
import { categoryGroups } from "@/lib/categoryGroups";

export function CategoryNav({ categories }: { categories: Category[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("home.categories");

  // Helper pour obtenir les noms des catégories d'un groupe
  const getGroupCategoryNames = (slugs: string[]) => {
    return categories
      .filter(c => slugs.includes(c.slug))
      .map(c => c.translations?.[locale]?.name || c.slug)
      .slice(0, 3) // Limiter à 3 pour l'affichage
      .join(", ");
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-display">
          {t("title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryGroups.map((group) => (
          <Link
            key={group.id}
            href={`/products?group=${group.id}`}
            className="group relative bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-primary-600 transition-colors line-clamp-1">
                {group.translations[locale]}
              </h3>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">
                {getGroupCategoryNames(group.categorySlugs)}
              </p>
            </div>
            
            {/* Image du groupe */}
            <div className="self-end relative w-12 h-12 -mb-1 -mr-1 opacity-90 group-hover:scale-110 transition-transform duration-300">
               <Image
                 src={group.image}
                 alt={group.translations[locale]}
                 fill
                 className="object-contain" // Utiliser object-contain pour ne pas couper l'image
                 sizes="48px"
               />
            </div>
          </Link>
        ))}

        {/* Card 'See all' styled comme sur l'image */}
        <Link
          href="/products"
          className="bg-[#d4edda] rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-[#c3e6cb] transition-colors cursor-pointer h-28"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
            <ArrowRight className="w-4 h-4 text-gray-900" />
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {locale === "fr" ? "Voir tout" : "See all"}
          </span>
        </Link>
      </div>
    </section>
  );
}
