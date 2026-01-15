"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight } from "lucide-react";

// Mock data - will be replaced with Supabase data
const mockProducts = [
  {
    id: "1",
    slug: "beetroot",
    name: { fr: "Betterave", en: "Beetroot" },
    description: { fr: "Betterave locale fraîche", en: "Fresh local beetroot" },
    price: 17.29,
    image_url: null,
    category: { fr: "Marché local", en: "Local market" },
    stock: 25,
    unit: "500 gm.",
  },
  {
    id: "2",
    slug: "italian-avocado",
    name: { fr: "Avocat Italien", en: "Italian Avocado" },
    description: { fr: "Avocat mûr à point", en: "Perfectly ripe avocado" },
    price: 12.29,
    image_url: null,
    category: { fr: "Marché local", en: "Local shop" },
    stock: 15,
    unit: "500 gm.",
  },
  {
    id: "3",
    slug: "szam-amm",
    name: { fr: "Szam Amm", en: "Szam Amm" },
    description: { fr: "Produit transformé", en: "Processed food" },
    price: 14.29,
    image_url: null,
    category: { fr: "Produit transformé", en: "Process food" },
    stock: 30,
    unit: "500 gm.",
  },
  {
    id: "4",
    slug: "beef-mixed",
    name: { fr: "Boeuf Mixte", en: "Beef Mixed" },
    description: { fr: "Viande de boeuf avec os", en: "Cut bone beef" },
    price: 16.29,
    image_url: null,
    category: { fr: "Surgelés", en: "Frozen Meal" },
    stock: 10,
    unit: "500 gm.",
  },
  {
    id: "5",
    slug: "cold-drinks-sprite",
    name: { fr: "Boissons fraîches", en: "Cold drinks" },
    description: { fr: "Sprite", en: "Sprite" },
    price: 18.29,
    image_url: null,
    category: { fr: "Boissons", en: "Drinks" },
    stock: 50,
    unit: "500 gm.",
  },
];

export function FeaturedProducts() {
  const t = useTranslations("home.featured");

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
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
