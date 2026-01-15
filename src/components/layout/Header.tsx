"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Zap,
  ChevronDown,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

export function Header() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-primary-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-white hover:bg-primary-600 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent-400 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-900" />
            </div>
            <span className="hidden sm:block text-xl font-bold text-white font-display">
              Lucian Connection
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="w-full h-11 pl-4 pr-12 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-500">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Delivery badge - Desktop */}
            <div className="hidden xl:flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-accent-400" />
              <span className="text-sm">
                {t("deliveryBadge").split("15")[0]}
                <span className="text-accent-400 font-bold">15 min</span>!
              </span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-400 text-primary-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 p-2 hover:bg-primary-600 rounded-lg text-white transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-sm">{t("login")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-primary-800 border-t border-primary-600">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="w-full h-11 pl-4 pr-12 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile nav links */}
            <div className="flex flex-col gap-2">
              <Link
                href="/products"
                className="text-white py-2 hover:text-accent-400"
              >
                Produits
              </Link>
              <Link
                href="/login"
                className="text-white py-2 hover:text-accent-400"
              >
                {t("login")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
