"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight } from "lucide-react";
import type { ProductWithCategory } from "@/lib/supabase/queries";

interface FeaturedProductsProps {
  products: ProductWithCategory[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations("home.featured");

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-display italic">
          {t("title")}
        </h2>
        <Link
          href="/products"
          className="text-primary-500 font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t("seeMore")}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
