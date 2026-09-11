"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, CreditCard } from "lucide-react";
import { useAdminOrderRealtime } from "./AdminOrderRealtimeProvider";
import type { Order } from "@/types/database.types";

type PendingOrder = Pick<Order, "id" | "total_amount" | "payment_status">;

export function LivePendingPayments() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const { refreshKey } = useAdminOrderRealtime();

  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active || !Array.isArray(data.orders)) return;
        setOrders(
          (data.orders as PendingOrder[])
            .filter((order) => order.payment_status === "pending_payment")
            .slice(0, 5),
        );
      })
      .catch((error) => console.error("Error refreshing pending payments:", error));
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (orders.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-amber-950">Paiements en attente</h2>
        </div>
        <Link href="/admin/orders" className="text-sm font-medium text-amber-800 hover:underline">
          Voir les commandes
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {orders.map((order) => (
          <Link key={order.id} href="/admin/orders" className="rounded-lg border border-amber-200 bg-white p-3 hover:border-amber-400">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-700">#{order.id.slice(0, 8)}</span>
              <CreditCard className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 font-semibold text-gray-900">{order.total_amount.toFixed(2)} €</p>
            <p className="mt-1 text-xs text-gray-500">En attente de paiement</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
