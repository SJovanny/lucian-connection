/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StockBadge } from "@/components/ui/Badge";
import {
  Search,
  Save,
  AlertTriangle,
  Package,
  Check,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product, Category } from "@/types/database.types";

type ProductWithCategory = Product & {
  categories: Category | null;
};

type FilterType = "all" | "low-stock" | "out-of-stock";

interface InventoryManagerProps {
  initialProducts: ProductWithCategory[];
  locale: string;
}

const ITEMS_PER_PAGE = 15;

export default function InventoryManager({
  initialProducts,
  locale,
}: InventoryManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<FilterType>("all");
  const [editing, setEditing] = useState<{ id: string; field: "stock" | "threshold" } | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = products.filter((product) => {
    // Filter by search
    const productName = product.translations[locale as "fr" | "en"]?.name || "";
    const matchesSearch = productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by stock status
    if (filter === "low-stock") {
      return product.stock > 0 && product.stock <= product.low_stock_threshold;
    }
    if (filter === "out-of-stock") {
      return product.stock === 0;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const stats = {
    total: products.length,
    lowStock: products.filter(
      (p) => p.stock > 0 && p.stock <= p.low_stock_threshold
    ).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const handleEdit = (id: string, field: "stock" | "threshold", currentValue: number) => {
    setEditing({ id, field });
    setEditValue(currentValue);
  };

  const handleSave = async (id: string, field: "stock" | "threshold") => {
    try {
      const response =
        field === "stock"
          ? await fetch("/api/admin/products/stock", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id, stock: editValue }),
          })
          : await fetch(`/api/admin/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ low_stock_threshold: editValue }),
          });

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? field === "stock"
                ? { ...p, stock: editValue }
                : { ...p, low_stock_threshold: editValue }
              : p
          )
        );
        setEditing(null);
        setSavedIds((prev) => new Set(prev).add(id));
        setTimeout(() => {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    field: "stock" | "threshold"
  ) => {
    if (e.key === "Enter") {
      handleSave(id, field);
    }
    if (e.key === "Escape") {
      setEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Gestion des stocks
        </h1>
        <p className="text-gray-500 mt-1">
          Surveillez et mettez à jour vos niveaux de stock
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          padding="md"
          className={`cursor-pointer ${filter === "all" ? "ring-2 ring-primary-500" : ""
            }`}
          onClick={() => {
            setFilter("all");
            setCurrentPage(1);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card
          padding="md"
          className={`cursor-pointer ${filter === "low-stock" ? "ring-2 ring-warning-500" : ""
            }`}
          onClick={() => {
            setFilter("low-stock");
            setCurrentPage(1);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock bas</p>
              <p className="text-2xl font-bold text-warning-600">
                {stats.lowStock}
              </p>
            </div>
            <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card
          padding="md"
          className={`cursor-pointer ${filter === "out-of-stock" ? "ring-2 ring-error-500" : ""
            }`}
          onClick={() => {
            setFilter("out-of-stock");
            setCurrentPage(1);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rupture</p>
              <p className="text-2xl font-bold text-error-600">
                {stats.outOfStock}
              </p>
            </div>
            <div className="w-10 h-10 bg-error-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-error-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card padding="md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          />
        </div>
      </Card>

      {/* Inventory Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Produit
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Slug
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Catégorie
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Stock actuel
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Seuil
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Statut
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const productName =
                    product.translations[locale as "fr" | "en"]?.name || "";
                  const categoryName =
                    product.categories?.translations[locale as "fr" | "en"]
                      ?.name || "Sans catégorie";
                  const isEditingStock =
                    editing?.id === product.id && editing.field === "stock";
                  const isEditingThreshold =
                    editing?.id === product.id && editing.field === "threshold";
                  const isEditingRow = editing?.id === product.id;

                  return (
                    <tr
                      key={product.id}
                      className={`${product.stock <= product.low_stock_threshold
                        ? "bg-warning-50/50"
                        : ""
                        } ${product.stock === 0 ? "bg-error-50/50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg opacity-50">🛒</span>
                            </div>
                          )}
                          <p className="font-medium text-gray-900">
                            {productName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                        {product.slug}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {categoryName}
                      </td>
                      <td className="px-6 py-4">
                        {isEditingStock ? (
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(parseInt(e.target.value) || 0)
                            }
                            onKeyDown={(e) => handleKeyDown(e, product.id, "stock")}
                            onBlur={() => handleSave(product.id, "stock")}
                            autoFocus
                            className="w-20 h-9 px-2 text-center rounded border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                          />
                        ) : (
                          <button
                            onClick={() => handleEdit(product.id, "stock", product.stock)}
                            className="font-semibold text-gray-900 cursor-pointer"
                          >
                            {product.stock}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditingThreshold ? (
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(parseInt(e.target.value) || 0)
                            }
                            onKeyDown={(e) => handleKeyDown(e, product.id, "threshold")}
                            onBlur={() => handleSave(product.id, "threshold")}
                            autoFocus
                            className="w-20 h-9 px-2 text-center rounded border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                          />
                        ) : (
                          <button
                            onClick={() =>
                              handleEdit(
                                product.id,
                                "threshold",
                                product.low_stock_threshold
                              )
                            }
                            className="font-semibold text-gray-900 cursor-pointer"
                          >
                            {product.low_stock_threshold}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StockBadge
                          stock={product.stock}
                          lowStockThreshold={product.low_stock_threshold}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {savedIds.has(product.id) && (
                            <span className="flex items-center gap-1 text-success-600 text-sm">
                              <Check className="w-4 h-4" />
                              Sauvegardé
                            </span>
                          )}
                          {isEditingRow ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleSave(product.id, editing!.field)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(product.id, "stock", product.stock)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} sur{" "}
              {filteredProducts.length} produits
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
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <span key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg ${currentPage === page
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
