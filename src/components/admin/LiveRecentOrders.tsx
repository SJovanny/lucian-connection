"use client";

import { useEffect, useState } from "react";
import type { Order, OrderItem } from "@/types/database.types";
import { useAdminOrderRealtime } from "./AdminOrderRealtimeProvider";

type OrderWithItems = Order & { order_items: OrderItem[] };

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  preparing: "En préparation",
  ready: "Prête",
  completed: "Terminée",
  cancelled: "Annulée",
  refunded: "Remboursement",
};

function formatTimeAgo(date: string) {
  const diffMinutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${Math.floor(diffHours / 24)}j`;
}

export function LiveRecentOrders({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const { refreshKey } = useAdminOrderRealtime();

  useEffect(() => {
    if (!refreshKey) return;
    let active = true;
    fetch("/api/admin/orders")
      .then((response) => response.json())
      .then((data) => {
        if (!active || !Array.isArray(data.orders)) return;
        setOrders(
          (data.orders as OrderWithItems[])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5),
        );
      })
      .catch((error) => console.error("Error refreshing dashboard orders:", error));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (orders.length === 0) {
    return (
      <tbody>
        <tr><td colSpan={4} className="py-8 text-center text-gray-500">Aucune commande pour le moment</td></tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-50">
      {orders.map((order) => (
        <tr key={order.id}>
          <td className="py-3">
            <span className="font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
            <p className="text-xs text-gray-400">{formatTimeAgo(order.created_at)}</p>
          </td>
          <td className="py-3 text-gray-600">{order.order_items?.length || 0} articles</td>
          <td className="py-3 font-semibold text-gray-900">{order.total_amount.toFixed(2)} €</td>
          <td className="py-3">
            <span className={`inline-block rounded-full px-2 py-1 text-xs ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
