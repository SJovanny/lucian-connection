"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { Card } from "@/components/ui/Card";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Locale, usePathname } from "@/i18n/routing";
import type { ProductWithCategory } from "@/lib/supabase/queries";
import type { Category } from "@/types/database.types";
import { CategoryFilter, CategoryFilterMobile } from "@/components/products/CategoryFilter";

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

  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer le nom de la catégorie dans la langue actuelle
  const getCategoryName = (category: Category) => {
    const translations = category.translations;
    return translations?.[locale]?.name || category.slug;
  };



  // Filtrer les produits côté client pour une UX plus rapide
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Filtre par catégorie
      const matchesCategory =
        selectedCategory === "all" ||
        product.categories?.slug === selectedCategory;

      // Filtre par recherche (côté client pour réactivité)
      const translations = product.translations;
      const productName = (translations?.[locale]?.name || product.slug).toLowerCase();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Trouver le nom de la catégorie sélectionnée
  const selectedCategoryObj = categories.find(c => c.slug === selectedCategory);
  const selectedCategoryName = selectedCategory === "all"
    ? (locale === "fr" ? "Tous les produits" : "All products")
    : selectedCategoryObj
      ? getCategoryName(selectedCategoryObj)
      : "";

  return (
    <div className="flex gap-8">
      {/* Sidebar des filtres - Desktop */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {locale === "fr" ? "Catégories" : "Categories"}
          </h2>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        {/* Filters - Mobile & Search */}
        <div className="mb-6 space-y-4">
          {/* Search + Filter button row */}
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1">
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

            {/* Filter button - Mobile only */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 h-11 bg-white border border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {locale === "fr" ? "Filtres" : "Filters"}
              </span>
            </button>
          </div>

          {/* Category Filter - Mobile */}
          <div className="lg:hidden">
            <CategoryFilterMobile
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Breadcrumb / Selected category indicator */}
          {selectedCategory !== "all" && (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => handleCategoryChange("all")}
                className="text-gray-500 hover:text-primary-500"
              >
                {locale === "fr" ? "Tous" : "All"}
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{selectedCategoryName}</span>
              <button
                onClick={() => handleCategoryChange("all")}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-gray-500 mb-6">
          {filteredProducts.length} {locale === "fr" ? "produits" : "products"}
        </p>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
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
    </div>
  );
}
