import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, StockBadge } from "@/components/ui/Badge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";

// Mock data - will be replaced with real Supabase data
const stats = {
  todayOrders: 12,
  todayRevenue: 458.9,
  pendingOrders: 5,
  lowStockProducts: 3,
};

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Marie Dupont",
    total: 45.99,
    status: "pending" as const,
    time: "Il y a 5 min",
  },
  {
    id: "ORD-002",
    customer: "Jean Martin",
    total: 78.5,
    status: "confirmed" as const,
    time: "Il y a 15 min",
  },
  {
    id: "ORD-003",
    customer: "Sophie Bernard",
    total: 32.0,
    status: "preparing" as const,
    time: "Il y a 30 min",
  },
];

const lowStockProducts = [
  { name: "Avocat Italien", stock: 3, threshold: 5 },
  { name: "Boeuf Mixte", stock: 2, threshold: 5 },
  { name: "Lait frais", stock: 4, threshold: 10 },
];

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

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenue dans votre espace d&apos;administration
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commandes du jour</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.todayOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus du jour</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${stats.todayRevenue.toFixed(2)}
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
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stock bas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.lowStockProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Commandes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/admin/orders"
              className="block text-center text-primary-500 text-sm font-medium mt-4 hover:underline"
            >
              Voir toutes les commandes →
            </a>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              Alertes stock bas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                  </div>
                  <StockBadge
                    stock={product.stock}
                    lowStockThreshold={product.threshold}
                  />
                </div>
              ))}
            </div>
            <a
              href="/admin/inventory"
              className="block text-center text-primary-500 text-sm font-medium mt-4 hover:underline"
            >
              Gérer l&apos;inventaire →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
