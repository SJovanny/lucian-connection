import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StockBadge } from "@/components/ui/Badge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  Eye,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react";
import { getProducts, getCategories, getRecentOrders, getOrderStats } from "@/lib/supabase/queries";
import Link from "next/link";
import Image from "next/image";
import type { Order, OrderItem } from "@/types/database.types";

type OrderWithItems = Order & {
  order_items: OrderItem[];
};

// Fonction pour récupérer les statistiques
async function getStats() {
  const [products, categories, orderStats] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrderStats(),
  ]);
  
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.low_stock_threshold
  );
  const featuredProducts = products.filter((p) => p.is_featured);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Calculer la valeur totale du stock
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.price * p.stock,
    0
  );

  return {
    totalProducts: products.length,
    totalCategories: categories.length,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    featuredCount: featuredProducts.length,
    totalStockValue,
    lowStockProducts: lowStockProducts.slice(0, 5),
    topProducts: products
      .filter((p) => p.is_featured)
      .slice(0, 5),
    ...orderStats,
  };
}

// Formater le temps écoulé
function formatTimeAgo(date: string) {
  const now = new Date();
  const orderDate = new Date(date);
  const diffMs = now.getTime() - orderDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-green-200 text-green-900",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(5),
  ]);
  
  const orders = recentOrders as OrderWithItems[];
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenue dans votre espace d&apos;administration
          </p>
        </div>
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Voir commandes
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Produits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalProducts}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.totalCategories} catégories
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valeur stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${stats.totalStockValue.toFixed(0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  en inventaire
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">À la Une</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.featuredCount}
                </p>
                <Link href="/admin/products?filter=featured" className="text-xs text-primary-500 mt-1">
                  Gérer →
                </Link>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.lowStockCount > 0 ? "ring-2 ring-red-200" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Alertes stock</p>
                <p className={`text-3xl font-bold mt-1 ${stats.lowStockCount > 0 ? "text-red-600" : "text-gray-900"}`}>
                  {stats.lowStockCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.outOfStockCount} en rupture
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.lowStockCount > 0 ? "bg-red-100" : "bg-gray-100"}`}>
                <AlertTriangle className={`w-6 h-6 ${stats.lowStockCount > 0 ? "text-red-600" : "text-gray-400"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Commandes récentes
              </CardTitle>
              <Link 
                href="/admin/orders" 
                className="text-sm text-primary-500 flex items-center gap-1"
              >
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Commande</th>
                    <th className="pb-3 font-medium">Articles</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3">
                        <span className="font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
                        <p className="text-xs text-gray-400">{formatTimeAgo(order.created_at)}</p>
                      </td>
                      <td className="py-3 text-gray-600">{order.order_items?.length || 0} articles</td>
                      <td className="py-3 font-semibold text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune commande pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Stock bas
              </CardTitle>
              <Link 
                href="/admin/inventory" 
                className="text-sm text-primary-500"
              >
                Inventaire
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.translations.fr.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {product.translations.fr.name}
                    </p>
                  </div>
                  <StockBadge
                    stock={product.stock}
                    lowStockThreshold={product.low_stock_threshold}
                  />
                </div>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm">Tous les stocks sont OK ! 🎉</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products à la Une */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Produits vedettes
              </CardTitle>
              <Link 
                href="/admin/products" 
                className="text-sm text-primary-500 flex items-center gap-1"
              >
                Gérer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="text-center">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.translations.fr.name}
                      width={60}
                      height={60}
                      className="w-14 h-14 rounded-lg object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {product.translations.fr.name}
                  </p>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <div className="col-span-5 text-center py-6 text-gray-500">
                  <Star className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun produit vedette</p>
                  <Link href="/admin/products" className="text-primary-500 text-sm">
                    Ajouter des produits vedettes
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats / Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
                <p className="text-sm text-gray-500">Commandes du jour</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">${stats.todayRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Revenus du jour</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-500">En cours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-gray-500">Total commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
