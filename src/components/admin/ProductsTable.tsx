"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, StockBadge } from "@/components/ui/Badge";
import {
  Edit,
  Trash2,
  Star,
  Loader2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ProductWithCategory } from "@/lib/supabase/queries";
import type { Category } from "@/types/database.types";
import { ConfirmModal } from "@/components/ui/Modal";

interface ProductsTableProps {
  initialProducts: ProductWithCategory[];
  categories: Category[];
}

const ITEMS_PER_PAGE = 15;

export function ProductsTable({ initialProducts, categories }: ProductsTableProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les produits
  const filteredProducts = products.filter((product) => {
    const name = product.translations.fr.name.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = product.is_active;
    if (statusFilter === "inactive") matchesStatus = !product.is_active;
    if (statusFilter === "low-stock") matchesStatus = product.stock <= product.low_stock_threshold;
    if (statusFilter === "featured") matchesStatus = product.is_featured;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        const errorBody = await response.json().catch(() => null);
        console.error("Error deleting product:", errorBody || response.status);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeletingId(null);
    }
  };

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
      }
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.translations.fr.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="low-stock">Stock bas</option>
            <option value="featured">Vedette</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-gray-500">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
          {filteredProducts.length !== products.length && ` (sur ${products.length})`}
        </span>
        <span className="text-yellow-600">
          ⭐ {products.filter((p) => p.is_featured).length} vedette{products.filter((p) => p.is_featured).length > 1 ? "s" : ""}
        </span>
        <span className="text-red-600">
          ⚠ {products.filter((p) => p.stock <= p.low_stock_threshold).length} stock bas
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Produit
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Catégorie
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Prix
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Stock
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Statut
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                  Vedette
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`${product.is_featured ? "bg-yellow-50/30" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.translations.fr.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.translations.fr.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.translations.en.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.categories?.translations.fr.name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-gray-400 line-through ml-1">
                        {product.compare_at_price.toFixed(2)}€
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge
                      stock={product.stock}
                      lowStockThreshold={product.low_stock_threshold}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.is_active ? "success" : "default"}>
                      {product.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(product.id, product.is_featured)}
                      disabled={loading === product.id}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                        product.is_featured
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      title={product.is_featured ? "Retirer de la une" : "Mettre à la une"}
                    >
                      {loading === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star
                          className={`w-4 h-4 ${product.is_featured ? "fill-yellow-500" : ""}`}
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button
                        className="p-2 rounded-lg hover:bg-error-50"
                        onClick={() => setDeleteTarget(product)}
                        disabled={deletingId === product.id}
                        title="Supprimer"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-error-500" />
                        )}
                      </button>
                    </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} sur {filteredProducts.length} produits
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and nearby pages
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? "bg-primary-500 text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id);
          }
        }}
        title="Supprimer le produit"
        message={
          deleteTarget
            ? `Êtes-vous sûr de vouloir supprimer “${deleteTarget.translations.fr.name}” ? Cette action est irréversible.`
            : ""
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}
