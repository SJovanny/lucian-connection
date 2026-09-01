"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  ShoppingCart,
  User,
  Menu,
  Zap,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchBar } from "./SearchBar";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations("header");
  const router = useRouter();
  const { items, toggleCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const prevItemCountRef = useRef(0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (itemCount > prevItemCountRef.current) {
      // The animation is intentionally synchronized with the external cart count.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCartAnimating(true);
      const timer = setTimeout(() => setIsCartAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    prevItemCountRef.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    if (!getSupabaseConfig()) {
      // Mark the initial auth check as complete when Supabase is unavailable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!getSupabaseConfig()) return;

    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="bg-primary-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[80px] items-center justify-between py-2 sm:min-h-[96px]">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-white hover:bg-primary-600 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center lg:static lg:translate-x-0">
            <img
              src="/logo_lc.svg"
              alt="Lucian Connection"
              className="h-10 w-auto sm:h-14"
            />
          </Link>

          {/* Search bar - Desktop */}
          <SearchBar 
            placeholder={t("searchPlaceholder")} 
            className="hidden lg:block flex-1 max-w-md mx-8"
          />

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Delivery badge - Desktop */}
            <div className="hidden xl:flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-accent-400" />
              <span className="text-sm">
                {t("deliveryBadge")}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Cart */}
            <button
              id="cart-icon-container"
              onClick={toggleCart}
              className={`relative p-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-white transition-all duration-300 ${
                isCartAnimating ? "scale-110 bg-primary-500 ring-2 ring-accent-400" : ""
              }`}
            >
              <ShoppingCart className={`w-6 h-6 ${isCartAnimating ? "animate-pulse" : ""}`} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-400 text-primary-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {isLoading ? (
              <div className="hidden sm:flex items-center gap-2 p-2 text-white">
                <div className="w-6 h-6 bg-primary-500 rounded-full animate-pulse" />
              </div>
            ) : user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 p-2 hover:bg-primary-600 rounded-lg text-white transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm truncate max-w-[100px]">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-primary-600 rounded-lg text-white transition-colors"
                  title={t("logout") || "Logout"}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 p-2 hover:bg-primary-600 rounded-lg text-white transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="text-sm">{t("login")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-primary-800 border-t border-primary-600">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile search */}
            <SearchBar 
              placeholder={t("searchPlaceholder")} 
              onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile language switcher */}
            <LanguageSwitcher />

            {/* Mobile nav links */}
            <div className="flex flex-col gap-2">
              <Link
                href="/products"
                className="text-white py-2 hover:text-accent-400"
              >
                Produits
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="text-white py-2 hover:text-accent-400 flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white py-2 hover:text-accent-400 flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    {t("logout") || "Logout"}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-white py-2 hover:text-accent-400"
                >
                  {t("login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
