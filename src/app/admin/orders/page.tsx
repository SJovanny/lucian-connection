"use client";

import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Search, Eye } from "lucide-react";
import { PickupSlotPicker } from "@/components/pickup/PickupSlotPicker";
import type { Order, OrderItem, Profile } from "@/types/database.types";
import { useState, useEffect } from "react";

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
  refunded: { label: "Remboursement", color: "bg-orange-100 text-orange-800" },
};

const statusOptions: Array<keyof typeof statusConfig> = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
  "refunded",
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Martinique",
  }).format(date);
}

function formatPickup(dateString: string | null): string {
  if (!dateString) return "Non planifié";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Martinique",
  }).format(new Date(dateString));
}

function pickupDateKey(dateString: string | null): string | null {
  if (!dateString) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Martinique",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [adminPickupAt, setAdminPickupAt] = useState<string | null>(null);
  const [isSavingPickup, setIsSavingPickup] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [pickupReloadToken, setPickupReloadToken] = useState(0);

  // Load orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data.orders);
        setStatusCounts(data.statusCounts);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.includes(searchTerm) ||
      order.profiles?.full_name?.includes(searchTerm) ||
      order.phone?.includes(searchTerm);
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesDate = !filterDate || pickupDateKey(order.pickup_at) === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewOrder = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setAdminPickupAt(order.pickup_at);
    setPickupError(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;

    setIsLoadingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      const { order: updatedOrder } = await res.json();

      // Update orders list
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o
        )
      );

      // Update selected order
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: updatedOrder.status } : prev
      );

      // Update status counts
      const oldStatus = selectedOrder.status;
      setStatusCounts((prev) => ({
        ...prev,
        [oldStatus]: prev[oldStatus] - 1,
        [newStatus]: prev[newStatus] + 1,
      }));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedOrder || !adminPickupAt) return;
    setIsSavingPickup(true);
    setPickupError(null);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/pickup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup_at: adminPickupAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "PICKUP_SLOT_UNAVAILABLE") {
          setPickupError("Ce créneau n'est plus disponible. Choisissez-en un autre.");
          setPickupReloadToken((value) => value + 1);
        } else {
          throw new Error(data.error || "update");
        }
        return;
      }
      const updatedOrder = data.order as Order;
      setOrders((prev) => prev.map((order) =>
        order.id === updatedOrder.id ? { ...order, pickup_at: updatedOrder.pickup_at } : order
      ));
      setSelectedOrder((prev) => prev ? { ...prev, pickup_at: updatedOrder.pickup_at } : prev);
    } catch (error) {
      console.error("Error updating pickup:", error);
      setPickupError("Erreur lors de la reprogrammation");
    } finally {
      setIsSavingPickup(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Commandes
          </h1>
          <p className="text-gray-500 mt-1">Chargement...</p>
        </div>
      </div>
    );
  }

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
        {statusOptions.map((status) => (
          <Card key={status} padding="md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {statusConfig[status].label}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {statusCounts[status] || 0}
              </span>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="preparing">En préparation</option>
            <option value="ready">Prête</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursement</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
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
                  Retrait prévu
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Créée le
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
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
                        {formatPickup(order.pickup_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          >
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

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Commande ${selectedOrder?.id.substring(0, 8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.profiles?.full_name || "Client inconnu"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium text-gray-900">
                  ${selectedOrder.total_amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
              <p className="text-sm text-gray-500">Retrait prévu</p>
              <p className="font-medium text-primary-800">{formatPickup(selectedOrder.pickup_at)}</p>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <PickupSlotPicker
                locale="fr"
                value={adminPickupAt}
                onChange={(value) => {
                  setAdminPickupAt(value);
                  setPickupError(null);
                }}
                reloadToken={pickupReloadToken}
              />
              {pickupError && <p className="text-sm text-red-600">{pickupError}</p>}
              <button
                type="button"
                onClick={handleReschedule}
                disabled={!adminPickupAt || adminPickupAt === selectedOrder.pickup_at || isSavingPickup}
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingPickup ? "Enregistrement..." : "Enregistrer le créneau"}
              </button>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Articles</h3>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                {selectedOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.total_price as number).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {selectedOrder.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-900">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Status Change */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Changer le statut</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={
                      isLoadingStatus || status === selectedOrder.status
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === selectedOrder.status
                        ? `${statusConfig[status].color} opacity-100 cursor-default`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    }`}
                  >
                    {statusConfig[status].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
