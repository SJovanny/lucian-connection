"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/Card";
import { ChevronRight } from "lucide-react";

const categories = [
  {
    id: "vegetables",
    slug: "vegetables",
    icon: "🥬",
    color: "bg-green-50",
  },
  {
    id: "snacks",
    slug: "snacks-breads",
    icon: "🥖",
    color: "bg-amber-50",
  },
  {
    id: "fruits",
    slug: "fruits",
    icon: "🍎",
    color: "bg-red-50",
  },
  {
    id: "meat",
    slug: "meat",
    icon: "🥩",
    color: "bg-rose-50",
  },
  {
    id: "dairy",
    slug: "dairy",
    icon: "🥛",
    color: "bg-blue-50",
  },
  {
    id: "drinks",
    slug: "drinks",
    icon: "🥤",
    color: "bg-cyan-50",
  },
];

export function CategoryNav() {
  const t = useTranslations("home.categories");

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-display">
          {t("title")}
        </h2>
        <Link
          href="/products"
          className="text-primary-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="flex-shrink-0"
          >
            <Card
              variant="outlined"
              padding="md"
              className="w-[160px] hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {t(category.id)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("localMarket")}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-2xl`}
                >
                  {category.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {/* See all card */}
        <Link href="/products" className="flex-shrink-0">
          <Card
            variant="default"
            padding="md"
            className="w-[100px] h-full bg-accent-100 hover:bg-accent-200 transition-colors cursor-pointer flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-10 h-10 bg-accent-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <ChevronRight className="w-5 h-5 text-primary-900" />
              </div>
              <span className="text-sm font-medium text-primary-900">
                Voir tout
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </section>
  );
}
