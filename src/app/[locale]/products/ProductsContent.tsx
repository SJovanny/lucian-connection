"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { Card } from "@/components/ui/Card";
import { Search, X } from "lucide-react";
import { Locale, usePathname } from "@/i18n/routing";
import type { ProductWithCategory } from "@/lib/supabase/queries";
import type { Category } from "@/types/database.types";

interface ProductsContentProps {
  initialProducts: ProductWithCategory[];
  categories: Category[];
  initialCategory: string;
  initialSearch: string;
}

export function ProductsContent({
  initialProducts,
  categories,
  initialCategory,
  initialSearch,
}: ProductsContentProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Récupérer le nom de la catégorie dans la langue actuelle
  const getCategoryName = (category: Category) => {
    const translations = category.translations;
    return translations?.[locale]?.name || category.slug;
  };

  // Récupérer le nom du produit dans la langue actuelle
  const getProductName = (product: ProductWithCategory) => {
    const translations = product.translations;
    return translations?.[locale]?.name || product.slug;
  };

  // Filtrer les produits côté client pour une UX plus rapide
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Filtre par catégorie
      const matchesCategory =
        selectedCategory === "all" || 
        product.categories?.slug === selectedCategory;
      
      // Filtre par recherche (côté client pour réactivité)
      const productName = getProductName(product).toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        productName.includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery, locale]);

  // Mettre à jour l'URL quand les filtres changent
  const updateURL = (category: string, search: string) => {
    const params = new URLSearchParams();
    if (category && category !== "all") {
      params.set("category", category);
    }
    if (search) {
      params.set("search", search);
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    updateURL(categorySlug, searchQuery);
  };

  // Gérer le changement de recherche
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Soumettre la recherche (par debounce ou entrée)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== initialSearch) {
        updateURL(selectedCategory, searchQuery);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={locale === "fr" ? "Rechercher un produit..." : "Search for a product..."}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                updateURL(selectedCategory, "");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {/* All category */}
          <button
            onClick={() => handleCategoryChange("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-primary-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary-200 hover:bg-primary-50"
            }`}
          >
            {locale === "fr" ? "Tous" : "All"}
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.slug
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary-200 hover:bg-primary-50"
              }`}
            >
              {getCategoryName(category)}
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
    </>
  );
}
