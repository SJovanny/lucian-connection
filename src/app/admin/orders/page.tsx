"use client";

import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, ChevronDown, Eye, RotateCcw, Search } from "lucide-react";
import { PickupSlotPicker } from "@/components/pickup/PickupSlotPicker";
import type { Order, OrderItem, OrderRefund, Profile } from "@/types/database.types";
import { useState, useEffect, useEffectEvent } from "react";
import { useAdminOrderRealtime } from "@/components/admin/AdminOrderRealtimeProvider";

type OrderWithDetails = Order & {
  order_items: OrderItem[];
  order_refunds: Pick<
    OrderRefund,
    "id" | "status" | "stripe_status" | "failure_reason" | "pending_reason" | "stripe_refund_id" | "stripe_reference" | "stripe_reference_status" | "stripe_reference_type" | "amount" | "items" | "created_at" | "last_stripe_sync_at"
  >[];
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

const editableStatusOptions: Array<keyof typeof statusConfig> = [
  "pending",
  "preparing",
  "ready",
  "completed",
  "cancelled",
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

function toCents(value: number): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

const refundStatusConfig = {
  pending: { label: "En cours", color: "bg-amber-100 text-amber-800" },
  requires_action: { label: "Action client requise", color: "bg-amber-100 text-amber-800" },
  succeeded: { label: "Confirmé", color: "bg-green-100 text-green-800" },
  failed: { label: "Échoué", color: "bg-red-100 text-red-800" },
  canceled: { label: "Annulé", color: "bg-gray-100 text-gray-700" },
};

function getRefundStatusConfig(refund: OrderWithDetails["order_refunds"][number]) {
  const status = refund.stripe_status === "requires_action" ? "requires_action" : refund.status;
  return refundStatusConfig[status as keyof typeof refundStatusConfig] || refundStatusConfig.pending;
}

function getRefundStatusMessage(refund: OrderWithDetails["order_refunds"][number]) {
  if (refund.stripe_status === "requires_action") {
    return "Stripe attend des informations du client pour finaliser ce remboursement.";
  }
  if (refund.status === "failed") {
    return refund.failure_reason ? `Stripe : ${refund.failure_reason}` : "Stripe n’a pas pu finaliser ce remboursement.";
  }
  if (refund.status === "pending" && refund.pending_reason) {
    return `Stripe : ${refund.pending_reason}`;
  }
  return null;
}

function getRefundedQuantities(order: OrderWithDetails): Map<string, number> {
  const quantities = new Map<string, number>();
  if (order.payment_status === "refunded") {
    for (const item of order.order_items) quantities.set(item.id, item.quantity);
    return quantities;
  }

  const orderItemIds = new Set(order.order_items.map((item) => item.id));
  const uniqueOrderItemIdByProductId = new Map<string, string>();
  const duplicateProductIds = new Set<string>();
  for (const item of order.order_items) {
    if (!item.product_id || duplicateProductIds.has(item.product_id)) continue;
    if (uniqueOrderItemIdByProductId.has(item.product_id)) {
      uniqueOrderItemIdByProductId.delete(item.product_id);
      duplicateProductIds.add(item.product_id);
    } else {
      uniqueOrderItemIdByProductId.set(item.product_id, item.id);
    }
  }

  for (const refund of order.order_refunds) {
    if (refund.status !== "succeeded") continue;
    if (!Array.isArray(refund.items)) continue;
    for (const refundedItem of refund.items) {
      if (!Number.isFinite(refundedItem.quantity) || refundedItem.quantity <= 0) continue;
      const orderItemId = refundedItem.order_item_id && orderItemIds.has(refundedItem.order_item_id)
        ? refundedItem.order_item_id
        : refundedItem.product_id && orderItemIds.has(refundedItem.product_id)
          ? refundedItem.product_id
          : refundedItem.product_id
            ? uniqueOrderItemIdByProductId.get(refundedItem.product_id)
            : undefined;
      if (!orderItemId) continue;
      quantities.set(orderItemId, (quantities.get(orderItemId) || 0) + refundedItem.quantity);
    }
  }

  return quantities;
}

export default function OrdersPage() {
  const { refreshKey, acknowledgeOrder } = useAdminOrderRealtime();
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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("");
  const [adminPickupAt, setAdminPickupAt] = useState<string | null>(null);
  const [isSavingPickup, setIsSavingPickup] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [pickupReloadToken, setPickupReloadToken] = useState(0);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [refundItemIds, setRefundItemIds] = useState<string[]>([]);
  const [isRefunding, setIsRefunding] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isVerifyingPickupAge, setIsVerifyingPickupAge] = useState(false);

  const loadOrders = useEffectEvent(async () => {
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
  });

  const refreshOrders = useEffectEvent(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders);
      setStatusCounts(data.statusCounts);
      setSelectedOrder((selected) => (
        selected ? data.orders.find((order: OrderWithDetails) => order.id === selected.id) || selected : null
      ));
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  });

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (refreshKey > 0) refreshOrders();
  }, [refreshKey]);

  useEffect(() => {
    if (!orders.some((order) => order.order_refunds.some((refund) => refund.status === "pending"))) return;

    const interval = window.setInterval(refreshOrders, 15000);
    return () => window.clearInterval(interval);
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(term) ||
      (order.profiles?.full_name ?? "").toLowerCase().includes(term) ||
      (order.phone ?? "").toLowerCase().includes(term);
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesPaymentStatus = !filterPaymentStatus || order.payment_status === filterPaymentStatus;
    const matchesMonth = !filterMonth || orderMonthKey(order.created_at) === filterMonth;
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesMonth;
  });
  const selectedRefundedQuantities = selectedOrder ? getRefundedQuantities(selectedOrder) : new Map<string, number>();
  const hasPendingRefund = selectedOrder?.order_refunds.some((refund) => refund.status === "pending") || false;

  const hasActiveFilters = searchTerm !== "" || filterStatus !== "" || filterPaymentStatus !== "" || filterMonth !== "";

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterPaymentStatus("");
    setFilterMonth("");
  };

  const handleViewOrder = (order: OrderWithDetails) => {
    acknowledgeOrder(order.id);
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
    const alreadyRefunded = selectedOrder.order_refunds
      .filter((refund) => refund.status === "succeeded")
      .reduce((total, refund) => total + toCents(refund.amount), 0);
    const refundAmount = fullOrder
      ? Math.max(0, toCents(selectedOrder.total_amount) - alreadyRefunded) / 100
      : productAmount;
    const refundLabel = fullOrder ? " (frais de préparation inclus)" : " (hors frais de préparation)";
    if (!refundAmount || !confirm(`Confirmer le remboursement de ${refundAmount.toFixed(2)} €${refundLabel} ?`)) return;
    setIsRefunding(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_order: fullOrder,
          item_ids: fullOrder ? [] : selectedItems.map((item) => item.id),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "refund");
      const refund = data.refund as OrderWithDetails["order_refunds"][number];
      const refundOrder = data.order as Pick<Order, "payment_status" | "status"> | null;
      const applyRefund = (order: OrderWithDetails): OrderWithDetails => ({
        ...order,
        ...(refundOrder || {}),
        order_refunds: [...order.order_refunds.filter((existingRefund) => existingRefund.id !== refund.id), refund],
      });
      setOrders((previousOrders) => previousOrders.map((order) => (
        order.id === selectedOrder.id ? applyRefund(order) : order
      )));
      setSelectedOrder((previousOrder) => previousOrder ? applyRefund(previousOrder) : previousOrder);
      if (refund.status === "succeeded") {
        alert("Remboursement confirmé par Stripe.");
      } else if (refund.status === "failed" || refund.status === "canceled") {
        alert("Stripe n’a pas finalisé le remboursement. Consultez son statut ci-dessous avant de réessayer.");
      } else {
        alert("Remboursement en cours de traitement par Stripe.");
      }
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

    if (newStatus === "completed" && selectedOrder.contains_alcohol && !selectedOrder.pickup_age_verified_at) {
      setStatusError("Cette commande contient de l’alcool. Vérifiez la pièce d’identité au retrait avant de la passer en terminée.");
      return;
    }

    setIsLoadingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 409 && data?.error === "Order must be paid before entering preparation") {
          setStatusError("Cette commande est encore en attente de paiement. Elle ne peut pas passer en préparation tant que Stripe n’a pas confirmé le paiement.");
          return;
        }
        if (res.status === 409 && data?.error === "PICKUP_AGE_REQUIRED") {
          setStatusError("Vérifiez la pièce d’identité du client au retrait avant de finaliser cette commande.");
          return;
        }
        throw new Error(data?.error || "Failed to update order status");
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
      setStatusError("Le statut de la commande n’a pas pu être mis à jour. Réessayez dans quelques instants.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handlePickupAgeVerification = async () => {
    if (!selectedOrder || isVerifyingPickupAge || !selectedOrder.contains_alcohol) return;

    setIsVerifyingPickupAge(true);
    setStatusError(null);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/age-verification`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "verification");

      const verification = data.order as Pick<Order, "pickup_age_verified_at" | "pickup_age_verified_by">;
      setOrders((prevOrders) => prevOrders.map((order) =>
        order.id === selectedOrder.id ? { ...order, ...verification } : order
      ));
      setSelectedOrder((prev) => prev ? { ...prev, ...verification } : prev);
    } catch (error) {
      console.error("Error verifying pickup age:", error);
      setStatusError("La vérification de l’âge n’a pas pu être enregistrée.");
    } finally {
      setIsVerifyingPickupAge(false);
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
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            aria-label="Filtrer par paiement"
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          >
            <option value="">Tous les paiements</option>
            <option value="paid">Paiements confirmés</option>
            <option value="pending_payment">Paiements en attente</option>
            <option value="cancelled">Paiements annulés</option>
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
                              order.payment_status === "pending_payment"
                                ? "bg-amber-100 text-amber-800"
                                : statusConfig[order.status].color
                            }`}
                          >
                            {order.payment_status === "pending_payment" ? "Paiement en attente" : statusConfig[order.status].label}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {selectedOrder.contains_alcohol && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-950">Vérification d’âge requise</p>
                <p className="mt-1 text-sm text-amber-900">
                  Vérifiez une pièce d’identité au retrait avant de remettre les produits alcoolisés.
                </p>
                {selectedOrder.pickup_age_verified_at ? (
                  <p className="mt-2 text-sm font-medium text-green-700">Âge vérifié pour ce retrait.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handlePickupAgeVerification}
                    disabled={isVerifyingPickupAge || selectedOrder.status !== "ready"}
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isVerifyingPickupAge
                      ? "Enregistrement..."
                      : selectedOrder.status === "ready"
                        ? "Confirmer la vérification"
                        : "Disponible quand la commande est prête"}
                  </button>
                )}
              </div>
            )}

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
                {selectedOrder.order_items?.map((item) => {
                  const refundedQuantity = Math.min(item.quantity, selectedRefundedQuantities.get(item.id) || 0);
                  const isFullyRefunded = refundedQuantity >= item.quantity;
                  const isPartiallyRefunded = refundedQuantity > 0 && !isFullyRefunded;

                  return (
                    <label key={item.id} className={`flex items-center justify-between text-sm gap-3 ${isFullyRefunded ? "cursor-not-allowed" : ""}`}>
                      <span className={`flex items-center gap-2 ${isFullyRefunded ? "text-gray-400" : "text-gray-600"}`}>
                        <input
                          type="checkbox"
                          checked={isFullyRefunded || refundItemIds.includes(item.id)}
                          disabled={isFullyRefunded || hasPendingRefund}
                          onChange={() => setRefundItemIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])}
                        />
                        <span className={isFullyRefunded ? "line-through" : ""}>{item.product_name} × {item.quantity}</span>
                        {isFullyRefunded && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 no-underline">Remboursé</span>}
                        {isPartiallyRefunded && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Remboursé {refundedQuantity}/{item.quantity}</span>}
                      </span>
                      <span className={`font-medium ${isFullyRefunded ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        ${(item.total_price as number).toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-3">
              <div><p className="font-semibold text-orange-900">Remboursement</p><p className="text-sm text-orange-800">Une annulation complète rembourse aussi les frais de préparation. Une sélection d’articles reste limitée aux produits concernés.</p></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleRefund(true)} disabled={isRefunding || hasPendingRefund || !["paid", "partially_refunded"].includes(selectedOrder.payment_status)} className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">{isRefunding ? "Traitement..." : "Rembourser la commande"}</button>
                <button type="button" onClick={() => handleRefund(false)} disabled={isRefunding || hasPendingRefund || refundItemIds.length === 0 || !["paid", "partially_refunded"].includes(selectedOrder.payment_status)} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-orange-700 border border-orange-300 hover:bg-orange-100 disabled:opacity-50">Rembourser la sélection</button>
              </div>
              {hasPendingRefund && <p className="text-sm text-orange-800">Un remboursement est déjà en cours de traitement par Stripe.</p>}
            </div>

            {selectedOrder.order_refunds.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Suivi Stripe des remboursements</h3>
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  {selectedOrder.order_refunds.map((refund) => {
                    const config = getRefundStatusConfig(refund);
                    const message = getRefundStatusMessage(refund);

                    return (
                      <div key={refund.id} className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{refund.amount.toFixed(2)} €</p>
                          <p className="text-xs text-gray-500">{formatDate(refund.created_at)}</p>
                          {refund.stripe_refund_id && <p className="mt-1 font-mono text-xs text-gray-500">{refund.stripe_refund_id}</p>}
                          {refund.stripe_reference && <p className="mt-1 text-xs text-gray-500">Référence banque : <span className="font-mono">{refund.stripe_reference}</span>{refund.stripe_reference_type ? ` (${refund.stripe_reference_type})` : ""}</p>}
                          {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                {editableStatusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={
                      isLoadingStatus || status === selectedOrder.status ||
                      (status === "completed" && selectedOrder.contains_alcohol && !selectedOrder.pickup_age_verified_at)
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

      <Modal
        isOpen={statusError !== null}
        onClose={() => setStatusError(null)}
        title="Paiement en attente"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm leading-6 text-amber-900">{statusError}</p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStatusError(null)}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              Compris
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
