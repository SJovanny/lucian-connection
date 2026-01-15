import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StockBadge } from "@/components/ui/Badge";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

// Mock data
const products = [
  {
    id: "1",
    slug: "beetroot",
    name: { fr: "Betterave", en: "Beetroot" },
    price: 17.29,
    category: "Légumes",
    stock: 25,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: true,
  },
  {
    id: "2",
    slug: "italian-avocado",
    name: { fr: "Avocat Italien", en: "Italian Avocado" },
    price: 12.29,
    category: "Légumes",
    stock: 3,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: true,
  },
  {
    id: "3",
    slug: "beef-mixed",
    name: { fr: "Boeuf Mixte", en: "Beef Mixed" },
    price: 16.29,
    category: "Viandes",
    stock: 0,
    lowStockThreshold: 5,
    isActive: false,
    isFeatured: false,
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Produits
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>
          <select className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500">
            <option value="">Toutes les catégories</option>
            <option value="vegetables">Légumes</option>
            <option value="fruits">Fruits</option>
            <option value="meat">Viandes</option>
            <option value="dairy">Produits laitiers</option>
          </select>
          <select className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="low-stock">Stock bas</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding="none">
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
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl opacity-50">🛒</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name.fr}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.name.en}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge
                      stock={product.stock}
                      lowStockThreshold={product.lowStockThreshold}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={product.isActive ? "success" : "default"}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </Badge>
                      {product.isFeatured && (
                        <Badge variant="accent">Vedette</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
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
