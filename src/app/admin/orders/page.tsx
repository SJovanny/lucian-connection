import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Eye, ChevronDown } from "lucide-react";

// Mock data
const orders = [
  {
    id: "ORD-001",
    customer: "Marie Dupont",
    email: "marie@email.com",
    phone: "+1 758 555 1234",
    total: 145.99,
    items: 5,
    status: "pending" as const,
    date: "15 Jan 2026, 14:30",
    address: "123 Main St, Castries",
  },
  {
    id: "ORD-002",
    customer: "Jean Martin",
    email: "jean@email.com",
    phone: "+1 758 555 5678",
    total: 78.5,
    items: 3,
    status: "confirmed" as const,
    date: "15 Jan 2026, 13:15",
    address: "456 Beach Rd, Gros Islet",
  },
  {
    id: "ORD-003",
    customer: "Sophie Bernard",
    email: "sophie@email.com",
    phone: "+1 758 555 9012",
    total: 232.0,
    items: 8,
    status: "preparing" as const,
    date: "15 Jan 2026, 11:45",
    address: "789 Hill View, Vieux Fort",
  },
  {
    id: "ORD-004",
    customer: "Pierre Dubois",
    email: "pierre@email.com",
    phone: "+1 758 555 3456",
    total: 56.75,
    items: 2,
    status: "ready" as const,
    date: "15 Jan 2026, 10:00",
    address: "321 Palm Ave, Soufriere",
  },
  {
    id: "ORD-005",
    customer: "Claire Leroy",
    email: "claire@email.com",
    phone: "+1 758 555 7890",
    total: 189.25,
    items: 6,
    status: "delivered" as const,
    date: "14 Jan 2026, 16:20",
    address: "654 Ocean Dr, Rodney Bay",
  },
];

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "En préparation", color: "bg-purple-100 text-purple-800" },
  ready: { label: "Prête", color: "bg-green-100 text-green-800" },
  delivered: { label: "Livrée", color: "bg-green-200 text-green-900" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
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
        {Object.entries({
          pending: 5,
          confirmed: 3,
          preparing: 2,
          ready: 1,
        }).map(([status, count]) => (
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
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.items} articles</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <button
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          statusConfig[order.status].color
                        }`}
                      >
                        {statusConfig[order.status].label}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {order.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-500" />
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
