/* eslint-disable @next/next/no-img-element */
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCartStore, CartItem } from "@/store/cartStore";
import { X, Minus, Plus, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchPricingQuote, getPricingErrorMessage, PricingQuoteRequestError } from "@/lib/client-pricing";
import { formatPriceCents } from "@/lib/utils";
import type { PricingQuote } from "@/lib/pricing-types";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, isOpen, closeCart, updateQuantity, removeItem } =
    useCartStore();
  const [quoteState, setQuoteState] = useState<{
    key: string;
    quote: PricingQuote;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const quoteKey = items
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join("|");
  const requestKey = `${locale}|${quoteKey}`;

  useEffect(() => {
    let isCurrent = true;

    if (items.length === 0) {
      return () => {
        isCurrent = false;
      };
    }

    fetchPricingQuote({
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
      locale,
    })
      .then((nextQuote) => {
        if (isCurrent) {
          setQuoteState({ key: requestKey, quote: nextQuote });
          setQuoteError(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setQuoteError({
            key: requestKey,
            message: error instanceof PricingQuoteRequestError
              ? getPricingErrorMessage(error.code, error.message, locale)
              : error instanceof Error ? error.message : getPricingErrorMessage("QUOTE_UNAVAILABLE", undefined, locale),
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [items, locale, requestKey]);

  if (!isOpen) return null;

  const displayQuote = quoteState?.key === requestKey ? quoteState.quote : null;
  const currentQuoteError = quoteError?.key === requestKey ? quoteError.message : null;

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
            aria-label={locale === "fr" ? "Fermer le panier" : "Close cart"}
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
                   quoteItem={displayQuote?.items.find((quoteItem) => quoteItem.product_id === item.id)}
                   locale={locale}
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
              {!displayQuote && !currentQuoteError ? (
                <p className="text-sm text-gray-500">{locale === "fr" ? "Calcul du total..." : "Calculating total..."}</p>
              ) : currentQuoteError ? (
                <p className="text-sm text-red-600">{currentQuoteError}</p>
              ) : displayQuote ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("subtotal")}</span>
                    <span className="font-medium">{formatPriceCents(displayQuote.subtotal_cents, locale)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("deliveryFee")}</span>
                    <span className="font-medium">{formatPriceCents(displayQuote.preparation_fee_cents, locale)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                    <span>{t("total")}</span>
                    <span className="text-primary-600">{formatPriceCents(displayQuote.total_cents, locale)}</span>
                  </div>
                </>
              ) : null}
            </div>
            {displayQuote && !currentQuoteError ? (
              <Link href="/checkout" onClick={closeCart} className="inline-flex w-full items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-base font-medium text-white transition-all duration-200 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 btn-press">
                {t("checkout")}
              </Link>
            ) : (
              <Button variant="primary" className="w-full" disabled={!displayQuote || !!currentQuoteError}>
                {t("checkout")}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

interface CartItemRowProps {
  item: CartItem;
  quoteItem?: PricingQuote["items"][number];
  locale: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, quoteItem, locale, onUpdateQuantity, onRemove }: CartItemRowProps) {
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
          {quoteItem ? formatPriceCents(quoteItem.unit_price_cents, locale) : "..."}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex flex-col items-end gap-2">
        <button
          aria-label={locale === "fr" ? `Retirer ${item.name} du panier` : `Remove ${item.name} from cart`}
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-error-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
          <button
            aria-label={locale === "fr" ? `Diminuer la quantité de ${item.name}` : `Decrease quantity of ${item.name}`}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>
          <button
            aria-label={locale === "fr" ? `Augmenter la quantité de ${item.name}` : `Increase quantity of ${item.name}`}
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
