"use client";

import { useState } from "react";
import { Eye, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { updateOrderStatus } from "@/lib/admin-actions";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: string | null;
  phone: string | null;
  notes: string | null;
  locale: string;
  coupon_id: string | null;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

type OrderWithDetails = Order & {
  order_items: OrderItem[];
  profiles: Profile | null;
};

interface OrdersTableProps {
  initialOrders: OrderWithDetails[];
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
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

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = (await updateOrderStatus(selectedOrder.id, status)) as {
        id: string;
        status: OrderStatus;
      };
      setOrders((prev: OrderWithDetails[]) =>
        prev.map((order) =>
          order.id === updated.id ? { ...order, status: updated.status } : order
        )
      );
      setSelectedOrder((prev: OrderWithDetails | null) =>
        prev ? { ...prev, status: updated.status } : prev
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusConfig).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                          {order.total_amount.toFixed(2)}€
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
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenModal(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2 text-primary-600 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Voir</span>
                        </button>
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
        onClose={handleCloseModal}
        title={`Détails de la commande #${selectedOrder?.id.substring(0, 8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Informations Client
                </h3>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">
                    {selectedOrder.profiles?.full_name || "Client inconnu"}
                  </p>
                  <p className="text-gray-600">{selectedOrder.phone || selectedOrder.profiles?.phone || "Pas de téléphone"}</p>
                  <p className="text-gray-600">{selectedOrder.delivery_address || "Pas d'adresse"}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Détails Commande
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {formatDate(selectedOrder.created_at)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Statut:</span>{" "}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status].color}`}>
                      {statusConfig[selectedOrder.status].label}
                    </span>
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-gray-600">
                      <span className="font-medium">Notes:</span> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Articles
              </h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Article</th>
                      <th className="text-center px-4 py-2 font-medium">Qté</th>
                      <th className="text-right px-4 py-2 font-medium">Prix</th>
                      <th className="text-right px-4 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.order_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-gray-900">{item.product_name}</td>
                        <td className="px-4 py-2 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{item.unit_price.toFixed(2)}€</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">{item.total_price.toFixed(2)}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-col items-end space-y-2">
                <div className="flex justify-between w-full max-w-[200px] text-sm text-gray-600">
                  <span>Sous-total:</span>
                  <span>{selectedOrder.subtotal.toFixed(2)}€</span>
                </div>
                {selectedOrder.delivery_fee > 0 && (
                  <div className="flex justify-between w-full max-w-[200px] text-sm text-gray-600">
                    <span>Frais de préparation:</span>
                    <span>{selectedOrder.delivery_fee.toFixed(2)}€</span>
                  </div>
                )}
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between w-full max-w-[200px] text-sm text-error-600">
                    <span>Réduction:</span>
                    <span>-{selectedOrder.discount_amount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between w-full max-w-[200px] text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{selectedOrder.total_amount.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={isUpdating || selectedOrder.status === "confirmed"}
                  className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  Confirmée
                </button>
                <button
                  onClick={() => handleStatusChange("preparing")}
                  disabled={isUpdating || selectedOrder.status === "preparing"}
                  className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  En préparation
                </button>
                <button
                  onClick={() => handleStatusChange("delivered")}
                  disabled={isUpdating || selectedOrder.status === "delivered"}
                  className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  Commande terminée
                </button>
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isUpdating || selectedOrder.status === "cancelled"}
                  className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Annulée
                </button>
              </div>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
