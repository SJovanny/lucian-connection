"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Produits",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Commandes",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Inventaire",
    href: "/admin/inventory",
    icon: BarChart3,
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-700 text-white rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-primary-800 text-white flex flex-col transform transition-transform duration-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-primary-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-400 rounded-lg flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <span className="font-bold font-display">Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 hover:bg-primary-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-primary-200 hover:bg-primary-700 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-700">
          <Link
            href="/fr"
            className="flex items-center gap-3 px-3 py-2.5 text-primary-200 hover:bg-primary-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Retour au site</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
