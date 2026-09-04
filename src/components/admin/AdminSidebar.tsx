"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  BarChart3,
  Settings,
  LogOut,
  Ticket,
  Menu,
  X,
  Home,
  Percent,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
    label: "Coupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    label: "Réductions",
    href: "/admin/reductions",
    icon: Percent,
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
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

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
            <img
              src="/logo_lc.svg"
              alt="Lucian Connection"
              className="h-10 w-auto"
            />
            <span className="font-bold font-display">Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded"
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-primary-200"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-700 space-y-1">
          <Link
            href="/fr"
            className="flex items-center gap-3 px-3 py-2.5 text-primary-200 rounded-lg"
          >
            <Home className="w-5 h-5" />
            <span>Retour au site</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-300 rounded-lg disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span>{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
