"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StockBadge } from "@/components/ui/Badge";
import { Search, Save, AlertTriangle, Package, Check } from "lucide-react";

// Mock data
const initialProducts = [
  {
    id: "1",
    name: "Betterave",
    sku: "VEG-001",
    category: "Légumes",
    stock: 25,
    lowStockThreshold: 5,
    trackStock: true,
    price: 17.29,
  },
  {
    id: "2",
    name: "Avocat Italien",
    sku: "VEG-002",
    category: "Légumes",
    stock: 3,
    lowStockThreshold: 5,
    trackStock: true,
    price: 12.29,
  },
  {
    id: "3",
    name: "Boeuf Mixte",
    sku: "MEA-001",
    category: "Viandes",
    stock: 0,
    lowStockThreshold: 5,
    trackStock: true,
    price: 16.29,
  },
  {
    id: "4",
    name: "Sprite",
    sku: "DRI-001",
    category: "Boissons",
    stock: 50,
    lowStockThreshold: 10,
    trackStock: true,
    price: 18.29,
  },
  {
    id: "5",
    name: "Lait frais",
    sku: "DAI-001",
    category: "Produits laitiers",
    stock: 4,
    lowStockThreshold: 10,
    trackStock: true,
    price: 5.99,
  },
];

type FilterType = "all" | "low-stock" | "out-of-stock";

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filteredProducts = products.filter((product) => {
    if (filter === "low-stock") {
      return product.stock > 0 && product.stock <= product.lowStockThreshold;
    }
    if (filter === "out-of-stock") {
      return product.stock === 0;
    }
    return true;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter(
      (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
    ).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const handleEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditValue(currentStock);
  };

  const handleSave = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: editValue } : p))
    );
    setEditingId(null);
    setSavedIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSave(id);
    }
    if (e.key === "Escape") {
      setEditingId(null);
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
          className={`cursor-pointer transition-all ${
            filter === "all" ? "ring-2 ring-primary-500" : ""
          }`}
          onClick={() => setFilter("all")}
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
          className={`cursor-pointer transition-all ${
            filter === "low-stock" ? "ring-2 ring-warning-500" : ""
          }`}
          onClick={() => setFilter("low-stock")}
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
          className={`cursor-pointer transition-all ${
            filter === "out-of-stock" ? "ring-2 ring-error-500" : ""
          }`}
          onClick={() => setFilter("out-of-stock")}
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
                  SKU
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
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 ${
                    product.stock <= product.lowStockThreshold
                      ? "bg-warning-50/50"
                      : ""
                  } ${product.stock === 0 ? "bg-error-50/50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg opacity-50">🛒</span>
                      </div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) =>
                          setEditValue(parseInt(e.target.value) || 0)
                        }
                        onKeyDown={(e) => handleKeyDown(e, product.id)}
                        onBlur={() => handleSave(product.id)}
                        autoFocus
                        className="w-20 h-9 px-2 text-center rounded border border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    ) : (
                      <button
                        onClick={() => handleEdit(product.id, product.stock)}
                        className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer"
                      >
                        {product.stock}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.lowStockThreshold}
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge
                      stock={product.stock}
                      lowStockThreshold={product.lowStockThreshold}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {savedIds.has(product.id) ? (
                        <span className="flex items-center gap-1 text-success-600 text-sm">
                          <Check className="w-4 h-4" />
                          Sauvegardé
                        </span>
                      ) : editingId === product.id ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSave(product.id)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
