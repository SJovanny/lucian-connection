"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Package, Search, Loader2 } from "lucide-react";
import type { ProductWithCategory } from "@/lib/supabase/queries";

interface FeaturedProductsManagerProps {
  initialProducts: ProductWithCategory[];
}

export function FeaturedProductsManager({ initialProducts }: FeaturedProductsManagerProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "featured" | "not-featured">("all");

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const name = product.translations.fr.name.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    
    if (filter === "featured") return matchesSearch && product.is_featured;
    if (filter === "not-featured") return matchesSearch && !product.is_featured;
    return matchesSearch;
  });

  // Produits à la une
  const featuredProducts = products.filter((p) => p.is_featured);
  const featuredCount = featuredProducts.length;

  // Toggle featured status
  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    setLoading(productId);
    
    try {
      const response = await fetch("/api/admin/products/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          isFeatured: !currentStatus,
        }),
      });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, is_featured: !currentStatus } : p
          )
        );
      } else {
        console.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Produits phares
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {featuredCount} produit{featuredCount > 1 ? "s" : ""} mis en avant sur la page d&apos;accueil
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les produits</option>
            <option value="featured">À la une uniquement</option>
            <option value="not-featured">Non mis en avant</option>
          </select>
        </div>
      </div>

      {/* Featured Products Preview */}
      {featuredCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            Aperçu des produits à la une ({featuredCount})
          </h3>
          <div className="flex flex-wrap gap-2">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-yellow-200"
              >
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.translations.fr.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <span className="text-sm text-gray-700">
                  {product.translations.fr.name}
                </span>
                <button
                  onClick={() => toggleFeatured(product.id, true)}
                  disabled={loading === product.id}
                  className="text-gray-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  À la Une
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`${
                    product.is_featured ? "bg-yellow-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.translations.fr.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.translations.fr.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.translations.en.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {product.categories?.translations.fr.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-400 line-through ml-1">
                        {product.compare_at_price.toFixed(2)}€
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                        product.stock <= product.low_stock_threshold
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured(product.id, product.is_featured)}
                      disabled={loading === product.id}
                      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                        product.is_featured
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {loading === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star
                          className={`w-4 h-4 ${
                            product.is_featured ? "fill-yellow-500" : ""
                          }`}
                        />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
