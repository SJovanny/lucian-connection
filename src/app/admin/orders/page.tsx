"use client";

import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ChevronDown, Eye, RotateCcw, Search } from "lucide-react";
import { PickupSlotPicker } from "@/components/pickup/PickupSlotPicker";
import type { Order, OrderItem, Profile } from "@/types/database.types";
import { useState, useEffect } from "react";

type OrderWithDetails = Order & {
  order_items: OrderItem[];
  profiles: Pick<Profile, "full_name" | "phone"> | null;
};

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  preparing: { label: "En préparation", color: "bg-purple-100 text-purple-800" },
  ready: { label: "Prête", color: "bg-green-100 text-green-800" },
  completed: { label: "Terminée", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
  refunded: { label: "Remboursement", color: "bg-orange-100 text-orange-800" },
};

const statusOptions: Array<keyof typeof statusConfig> = [
  "pending",
  "preparing",
  "ready",
  "completed",
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

function orderMonthKey(dateString: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Martinique",
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateString));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("");
  const [adminPickupAt, setAdminPickupAt] = useState<string | null>(null);
  const [isSavingPickup, setIsSavingPickup] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [pickupReloadToken, setPickupReloadToken] = useState(0);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [refundItemIds, setRefundItemIds] = useState<string[]>([]);
  const [isRefunding, setIsRefunding] = useState(false);

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
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(term) ||
      (order.profiles?.full_name ?? "").toLowerCase().includes(term) ||
      (order.phone ?? "").toLowerCase().includes(term);
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesMonth = !filterMonth || orderMonthKey(order.created_at) === filterMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const hasActiveFilters = searchTerm !== "" || filterStatus !== "pending" || filterMonth !== "";

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("pending");
    setFilterMonth("");
  };

  const handleViewOrder = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setAdminPickupAt(order.pickup_at);
    setPickupError(null);
    setIsRescheduleOpen(false);
    setRefundItemIds([]);
    setIsModalOpen(true);
  };

  const handleRefund = async (fullOrder: boolean) => {
    if (!selectedOrder || isRefunding) return;
    const selectedItems = selectedOrder.order_items.filter((item) => refundItemIds.includes(item.id));
    const grossSelected = fullOrder ? selectedOrder.subtotal : selectedItems.reduce((sum, item) => sum + Number(item.total_price), 0);
    const productAmount = fullOrder ? selectedOrder.total_amount - selectedOrder.delivery_fee : grossSelected * (selectedOrder.subtotal ? (selectedOrder.subtotal - selectedOrder.discount_amount) / selectedOrder.subtotal : 1);
    if (!productAmount || !confirm(`Confirmer le remboursement de ${productAmount.toFixed(2)} € (hors frais de préparation) ?`)) return;
    setIsRefunding(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: productAmount, product_amount: productAmount, items: fullOrder ? [] : selectedItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity, amount: item.total_price })) }),
      });
      if (!response.ok) throw new Error("refund");
      alert("Remboursement envoyé à Stripe. Les points seront ajustés après confirmation.");
      setRefundItemIds([]);
    } catch (error) {
      console.error("Error creating refund", error);
      alert("Le remboursement n'a pas pu être créé.");
    } finally {
      setIsRefunding(false);
    }
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
          setAdminPickupAt(null);
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
      setIsRescheduleOpen(false);
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
            <option value="preparing">En préparation</option>
            <option value="ready">Prête</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursement</option>
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            title="Filtrer par mois de commande"
            aria-label="Filtrer par mois de commande"
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-11 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
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

            <div className="border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen((isOpen) => !isOpen)}
                aria-expanded={isRescheduleOpen}
                className="flex w-full items-center justify-between text-left font-semibold text-gray-900"
              >
                Modifier le créneau de retrait
                <ChevronDown className={`h-5 w-5 text-gray-500 ${isRescheduleOpen ? "rotate-180" : ""}`} />
              </button>
              {isRescheduleOpen && (
                <div className="mt-3 space-y-3">
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
              )}
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Articles</h3>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                {selectedOrder.order_items?.map((item) => (
                  <label key={item.id} className="flex items-center justify-between text-sm gap-3">
                    <span className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" checked={refundItemIds.includes(item.id)} onChange={() => setRefundItemIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])} />
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.total_price as number).toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-3">
              <div><p className="font-semibold text-orange-900">Remboursement</p><p className="text-sm text-orange-800">Les frais de préparation sont toujours exclus. La confirmation Stripe déterminera la mise à jour des points.</p></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleRefund(true)} disabled={isRefunding || !["paid", "partially_refunded"].includes(selectedOrder.payment_status)} className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">{isRefunding ? "Traitement..." : "Rembourser les produits"}</button>
                <button type="button" onClick={() => handleRefund(false)} disabled={isRefunding || refundItemIds.length === 0 || !["paid", "partially_refunded"].includes(selectedOrder.payment_status)} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-orange-700 border border-orange-300 hover:bg-orange-100 disabled:opacity-50">Rembourser la sélection</button>
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
