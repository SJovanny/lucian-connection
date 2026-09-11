"use client";

import { Bell, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAdminOrderRealtime } from "./AdminOrderRealtimeProvider";

export function AdminNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { notifications, unreadCount, soundEnabled, toggleSound, connectionStatus, acknowledgeOrder } = useAdminOrderRealtime();
  const panelOpen = isOpen || isHovering;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen((open) => !open);
  };

  return (
    <div
      ref={containerRef}
      className="relative z-50"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div>
        <button
          type="button"
          onClick={togglePanel}
          aria-label="Ouvrir les notifications"
          aria-expanded={panelOpen}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:scale-105 hover:text-primary-600"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {panelOpen && (
        <div className="absolute right-0 top-12 max-h-80 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 text-gray-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-2 pb-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              Notifications
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionStatus === "live"
                    ? "bg-green-500"
                    : connectionStatus === "error"
                      ? "bg-red-500"
                      : "bg-amber-500"
                }`}
                title={connectionStatus === "live" ? "Temps réel actif" : connectionStatus === "error" ? "Polling en erreur" : "Polling actif"}
              />
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleSound} className="flex items-center gap-1 text-gray-500" title={soundEnabled ? "Couper le son" : "Activer le son"}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-xs">Son</span>
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500" aria-label="Fermer les notifications">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-gray-500">Aucune notification</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="border-b border-gray-100 px-2 py-3 last:border-0">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{new Date(notification.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => acknowledgeOrder(notification.orderId)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={`Supprimer la notification ${notification.title}`}
                    title="Supprimer cette notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
