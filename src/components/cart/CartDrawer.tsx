"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCartStore, CartItem } from "@/store/cartStore";
import { X, Minus, Plus, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("cart");
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } =
    useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 0 ? 5.0 : 0;
  const total = subtotal + deliveryFee;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">{t("empty")}</p>
              <Button onClick={closeCart} variant="primary">
                {t("continueShopping")}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("deliveryFee")}</span>
                <span className="font-medium">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                <span>{t("total")}</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button variant="primary" className="w-full">
                {t("checkout")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-4 p-4">
      {/* Image */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <Package className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm truncate">
          {item.name}
        </h3>
        <p className="text-xs text-gray-500">{item.unit}</p>
        <p className="font-semibold text-gray-900 mt-1">
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-error-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
