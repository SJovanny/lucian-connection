"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Search, X, Loader2 } from "lucide-react";
import { Locale } from "@/i18n/routing";

type SearchResult = {
  id: string;
  slug: string;
  price: number;
  image_url: string | null;
  translations: {
    fr: { name: string; description: string };
    en: { name: string; description: string };
  };
  categories: {
    slug: string;
    translations: {
      fr: { name: string };
      en: { name: string };
    };
  } | null;
};

interface SearchBarProps {
  placeholder: string;
  className?: string;
  onClose?: () => void;
}

export function SearchBar({ placeholder, className = "", onClose }: SearchBarProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.products);
        setIsOpen(data.products.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleResultClick = (product: SearchResult) => {
    const productName = product.translations?.[locale]?.name || product.slug;
    router.push(`/products?search=${encodeURIComponent(productName)}`);
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  const getProductName = (product: SearchResult) => {
    return product.translations?.[locale]?.name || product.slug;
  };

  const getCategoryName = (product: SearchResult) => {
    return product.categories?.translations?.[locale]?.name || product.categories?.slug || "";
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full h-11 pl-4 pr-12 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="p-2 text-gray-400 hover:text-primary-500"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Dropdown des résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <ul className="py-2">
            {results.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => handleResultClick(product)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Image */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={getProductName(product)}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl opacity-50">🛒</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {getProductName(product)}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {getCategoryName(product)}
                    </p>
                  </div>
                  
                  {/* Prix */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">
                      {product.price.toFixed(2)}€
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          
          {/* Voir tous les résultats */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 text-center text-primary-500 font-medium hover:bg-gray-50 transition-colors"
            >
              {locale === "fr" 
                ? `Voir tous les résultats pour "${query}"`
                : `See all results for "${query}"`
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
