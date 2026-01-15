"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/products/ProductCard";
import { Card } from "@/components/ui/Card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Locale } from "@/i18n/routing";

// Mock data
const categories = [
  { id: "all", name: { fr: "Tous", en: "All" }, slug: "all" },
  { id: "vegetables", name: { fr: "Légumes", en: "Vegetables" }, slug: "vegetables" },
  { id: "fruits", name: { fr: "Fruits", en: "Fruits" }, slug: "fruits" },
  { id: "meat", name: { fr: "Viandes", en: "Meat" }, slug: "meat" },
  { id: "dairy", name: { fr: "Produits laitiers", en: "Dairy" }, slug: "dairy" },
  { id: "drinks", name: { fr: "Boissons", en: "Drinks" }, slug: "drinks" },
];

const mockProducts = [
  {
    id: "1",
    slug: "beetroot",
    name: { fr: "Betterave", en: "Beetroot" },
    description: { fr: "Betterave locale fraîche", en: "Fresh local beetroot" },
    price: 17.29,
    image_url: null,
    category: { fr: "Marché local", en: "Local market" },
    categorySlug: "vegetables",
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
    categorySlug: "vegetables",
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
    categorySlug: "snacks",
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
    categorySlug: "meat",
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
    categorySlug: "drinks",
    stock: 50,
    unit: "500 ml.",
  },
  {
    id: "6",
    slug: "local-carrots",
    name: { fr: "Carottes Locales", en: "Local Carrots" },
    description: { fr: "Carottes fraîches", en: "Fresh carrots" },
    price: 8.99,
    image_url: null,
    category: { fr: "Légumes", en: "Vegetables" },
    categorySlug: "vegetables",
    stock: 30,
    unit: "1 kg.",
  },
  {
    id: "7",
    slug: "fresh-milk",
    name: { fr: "Lait frais", en: "Fresh milk" },
    description: { fr: "Lait entier", en: "Whole milk" },
    price: 5.99,
    image_url: null,
    category: { fr: "Produits laitiers", en: "Dairy" },
    categorySlug: "dairy",
    stock: 20,
    unit: "1 L.",
  },
  {
    id: "8",
    slug: "mango",
    name: { fr: "Mangue", en: "Mango" },
    description: { fr: "Mangue juteuse", en: "Juicy mango" },
    price: 6.49,
    image_url: null,
    category: { fr: "Fruits", en: "Fruits" },
    categorySlug: "fruits",
    stock: 40,
    unit: "each",
  },
];

export default function ProductsPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("products");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.categorySlug === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.name[locale].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              {t("title")}
            </h1>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("filters.all")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? "bg-primary-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-primary-200 hover:bg-primary-50"
                  }`}
                >
                  {category.name[locale]}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-gray-500 mb-6">
            {filteredProducts.length} {locale === "fr" ? "produits" : "products"}
          </p>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <div className="py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  {locale === "fr"
                    ? "Aucun produit trouvé"
                    : "No products found"}
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
