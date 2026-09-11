"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type OrderRow = { id: string; status: string; payment_status: string; total_amount: number; created_at?: string };
type OrderChange = RealtimePostgresChangesPayload<OrderRow>;
type AdminNotification = {
  id: string;
  orderId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  paymentPending?: boolean;
};

type AdminOrderRealtimeContextValue = {
  refreshKey: number;
  soundEnabled: boolean;
  notifications: AdminNotification[];
  unreadCount: number;
  toggleSound: () => void;
  acknowledgeOrder: (orderId: string) => void;
  connectionStatus: "connecting" | "live" | "polling" | "error";
};

const AdminOrderRealtimeContext = createContext<AdminOrderRealtimeContextValue | null>(null);
const notificationsStorageKey = "admin-order-notifications";
const acknowledgedOrdersStorageKey = "admin-acknowledged-orders";

function playNotificationSound() {
  if (typeof window === "undefined") return;

  const AudioContextClass = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  void context.resume().then(() => {
    const notes = [
      { frequency: 523.25, start: 0, duration: 0.18 },
      { frequency: 659.25, start: 0.18, duration: 0.18 },
      { frequency: 783.99, start: 0.36, duration: 0.2 },
      { frequency: 659.25, start: 0.56, duration: 0.28 },
    ];

    for (const note of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + note.start;
      const end = start + note.duration;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(note.frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end);
    }

    window.setTimeout(() => void context.close(), 950);
  }).catch(() => void context.close());
}

function notificationForChange(change: OrderChange): AdminNotification | null {
  if (change.eventType === "INSERT" && change.new.payment_status === "paid") {
    const total = Number(change.new.total_amount || 0).toFixed(2);
    return {
      id: `${change.commit_timestamp}-${change.new.id}`,
      orderId: change.new.id,
      title: "Nouvelle commande",
      message: `Commande #${change.new.id.slice(0, 8)} · ${total} €`,
      createdAt: change.commit_timestamp || new Date().toISOString(),
      read: false,
    };
  }

  if (
    change.eventType === "UPDATE" &&
    change.old.payment_status !== "paid" &&
    change.new.payment_status === "paid"
  ) {
    const total = Number(change.new.total_amount || 0).toFixed(2);
    return {
      id: `${change.commit_timestamp}-${change.new.id}`,
      orderId: change.new.id,
      title: "Nouvelle commande",
      message: `Commande #${change.new.id.slice(0, 8)} · ${total} €`,
      createdAt: change.commit_timestamp || new Date().toISOString(),
      read: false,
    };
  }

  if (change.eventType === "UPDATE" && change.old.status !== change.new.status) {
    if (!["paid", "partially_refunded"].includes(change.new.payment_status)) return null;
    return {
      id: `${change.commit_timestamp}-${change.new.id}`,
      orderId: change.new.id,
      title: "Statut de commande modifié",
      message: `Commande #${change.new.id.slice(0, 8)} : ${change.new.status}`,
      createdAt: change.commit_timestamp || new Date().toISOString(),
      read: false,
    };
  }

  return null;
}

export function AdminOrderRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => (
    typeof window === "undefined" || window.localStorage.getItem("admin-order-sound") !== "off"
  ));
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<AdminOrderRealtimeContextValue["connectionStatus"]>("connecting");
  const notificationsRef = useRef(notifications);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const getAcknowledgedOrders = () => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(acknowledgedOrdersStorageKey) || "[]");
      return new Set<string>(Array.isArray(stored) ? stored : []);
    } catch {
      return new Set<string>();
    }
  };

  const persistNotifications = (next: AdminNotification[]) => {
    notificationsRef.current = next;
    setNotifications(next);
    window.localStorage.setItem(notificationsStorageKey, JSON.stringify(next));
  };

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    // Restore browser-persisted notifications after hydration to keep the server
    // and client markup identical on the first render.
    try {
      const stored = JSON.parse(window.localStorage.getItem(notificationsStorageKey) || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        persistNotifications(stored.filter((notification) => !notification.paymentPending));
      }
    } catch {
      console.warn("Unable to restore admin notifications from local storage");
    }

    const pollOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders", { cache: "no-store" });
        if (!response.ok) throw new Error(`Orders request failed with ${response.status}`);
        const data = await response.json();
        if (!active || !Array.isArray(data.orders)) return;

        // Polling is the reliable source of truth when Realtime is unavailable.
        // Notify both the dashboard list and the orders page of fresh data.
        setRefreshKey((key) => key + 1);

        const acknowledged = getAcknowledgedOrders();
        const currentNotifications = notificationsRef.current;
        const existingOrderIds = new Set(currentNotifications.map((notification) => notification.orderId));
        const cutoff = Date.now() - 48 * 60 * 60 * 1000;
        const recentOrders = data.orders
          .filter((order: OrderRow) => (
            Boolean(order.created_at) &&
            new Date(order.created_at as string).getTime() >= cutoff &&
            order.payment_status === "paid" &&
            !acknowledged.has(order.id)
          ));
        const recovered = recentOrders
          .filter((order: OrderRow) => !existingOrderIds.has(order.id))
          .slice(0, 30)
          .map((order: OrderRow): AdminNotification => ({
            id: `recovered-${order.id}`,
            orderId: order.id,
            title: "Nouvelle commande",
            message: `Commande #${order.id.slice(0, 8)} · ${Number(order.total_amount || 0).toFixed(2)} €`,
            createdAt: order.created_at || new Date().toISOString(),
            read: false,
            paymentPending: false,
          }));
        const paidTransitions = recentOrders
          .filter((order: OrderRow) => {
            const existing = currentNotifications.find((notification) => notification.orderId === order.id);
            return existing?.paymentPending && order.payment_status === "paid";
          })
          .map((order: OrderRow): AdminNotification => ({
            id: `paid-${order.id}`,
            orderId: order.id,
            title: "Nouvelle commande",
            message: `Commande #${order.id.slice(0, 8)} · ${Number(order.total_amount || 0).toFixed(2)} €`,
            createdAt: order.created_at || new Date().toISOString(),
            read: false,
            paymentPending: false,
          }));

        if (recovered.length > 0 || paidTransitions.length > 0) {
          const replacements = new Map(paidTransitions.map((notification: AdminNotification) => [notification.orderId, notification]));
          const next = [
            ...recovered,
            ...currentNotifications.filter((notification: AdminNotification) => !replacements.has(notification.orderId)),
          ];
          for (const notification of paidTransitions) next.unshift(notification);
          persistNotifications(next.slice(0, 30));
          if (soundEnabledRef.current && (paidTransitions.length > 0 || recovered.some((notification: AdminNotification) => !notification.paymentPending))) {
            playNotificationSound();
          }
        }
        setConnectionStatus((status) => status === "live" ? status : "polling");
      } catch (error) {
        console.error("Unable to poll order notifications:", error);
        setConnectionStatus("error");
      }
    };

    // Recover notifications created while the admin page was closed, then poll as a fallback.
    void pollOrders();
    const pollingInterval = window.setInterval(() => void pollOrders(), 15000);

    /* Realtime is kept for instant delivery when the websocket is available. */
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const change = payload as unknown as OrderChange;
          const notification = notificationForChange(change);
          if (notification) {
            const acknowledged = getAcknowledgedOrders();
            if (!acknowledged.has(notification.orderId)) {
              setNotifications((current) => {
                const next = [notification, ...current.filter((item) => item.orderId !== notification.orderId)].slice(0, 30);
                notificationsRef.current = next;
                window.localStorage.setItem(notificationsStorageKey, JSON.stringify(next));
                return next;
              });
              if (soundEnabledRef.current) playNotificationSound();
            }
          }
          setRefreshKey((key) => key + 1);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("live");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`Order Realtime status: ${status}; polling remains active.`);
          setConnectionStatus("polling");
        }
      });

    return () => {
      active = false;
      window.clearInterval(pollingInterval);
      void supabase.removeChannel(channel);
    };
  }, []);

  const toggleSound = () => {
    setSoundEnabled((enabled) => {
      const next = !enabled;
      window.localStorage.setItem("admin-order-sound", next ? "on" : "off");
      if (next) playNotificationSound();
      return next;
    });
  };

  const acknowledgeOrder = (orderId: string) => {
    const acknowledged = getAcknowledgedOrders();
    acknowledged.add(orderId);
    window.localStorage.setItem(acknowledgedOrdersStorageKey, JSON.stringify([...acknowledged]));
    persistNotifications(notificationsRef.current.filter((notification) => notification.orderId !== orderId));
  };

  return (
    <AdminOrderRealtimeContext.Provider
      value={{
        refreshKey,
        soundEnabled,
        notifications,
        unreadCount: notifications.filter((notification) => !notification.read).length,
        toggleSound,
        acknowledgeOrder,
        connectionStatus,
      }}
    >
      {children}
    </AdminOrderRealtimeContext.Provider>
  );
}

export function useAdminOrderRealtime() {
  const context = useContext(AdminOrderRealtimeContext);
  if (!context) throw new Error("useAdminOrderRealtime must be used inside AdminOrderRealtimeProvider");
  return context;
}
