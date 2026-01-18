import { Card } from "@/components/ui/Card";
import { Search, Eye, ChevronDown } from "lucide-react";
import { getAllOrders, getOrderStatusCounts } from "@/lib/supabase/queries";
import type { Order, OrderItem, Profile } from "@/types/database.types";

type OrderWithDetails = Order & {
  order_items: OrderItem[];
  profiles: Pick<Profile, "full_name" | "phone"> | null;
};

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "En préparation", color: "bg-purple-100 text-purple-800" },
  ready: { label: "Prête", color: "bg-green-100 text-green-800" },
  delivered: { label: "Livrée", color: "bg-green-200 text-green-900" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function OrdersPage() {
  const orders = (await getAllOrders()) as OrderWithDetails[];
  const statusCounts = await getOrderStatusCounts();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Commandes
        </h1>
        <p className="text-gray-500 mt-1">
          Gérez et suivez toutes les commandes clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} padding="md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {statusConfig[status as keyof typeof statusConfig].label}
              </span>
              <span className="text-2xl font-bold text-gray-900">{count}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>
          <select className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="preparing">En préparation</option>
            <option value="ready">Prête</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
          <input
            type="date"
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Commande
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Client
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Total
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Statut
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const itemCount = order.order_items?.length || 0;
                  const customerName = order.profiles?.full_name || "Client inconnu";
                  const customerPhone = order.profiles?.phone || order.phone || "N/A";
                  
                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-xs">
                          {order.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">{itemCount} articles</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{customerName}</p>
                        <p className="text-sm text-gray-500">{customerPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              statusConfig[order.status].color
                            }`}
                          >
                            {statusConfig[order.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button className="p-2 rounded-lg">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
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
    </div>
  );
}
