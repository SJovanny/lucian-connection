"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";
import type { CartItem } from "@/store/cartStore";
import type { PricingQuote } from "@/lib/pricing-types";
import type { useCheckoutCoupon } from "@/lib/client/useCheckoutCoupon";
import { formatPriceCents } from "@/lib/utils";

type Props = {
  items: CartItem[];
  locale: Locale;
  quote: PricingQuote | null;
  error: string | null;
  coupon: ReturnType<typeof useCheckoutCoupon>;
};

export function OrderSummary({ items, locale, quote, error, coupon }: Props) {
  const t = useTranslations("checkout");
  const { appliedCoupon, couponCode, setCouponCode, couponError, isValidatingCoupon, handleApplyCoupon, removeCoupon } = coupon;
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("orderSummary")}</h2>
      {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.name} × {item.quantity}</span>
            <span className="font-medium">{quote ? formatPriceCents(quote.items.find((line) => line.product_id === item.id)?.total_price_cents || 0, locale) : "..."}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        {!appliedCoupon ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">{locale === "fr" ? "Code promo" : "Promo code"}</label>
            <div className="flex gap-2">
              <Input name="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="CODE123" />
              <Button type="button" onClick={handleApplyCoupon} variant="secondary" isLoading={isValidatingCoupon} disabled={!couponCode.trim()}>
                {locale === "fr" ? "Appliquer" : "Apply"}
              </Button>
            </div>
            {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-green-700 font-medium text-sm">{appliedCoupon.code}</p>
              <p className="text-green-600 text-xs">-{quote ? formatPriceCents(quote.discount_cents, locale) : "..."}</p>
            </div>
            <button type="button" onClick={removeCoupon} aria-label={locale === "fr" ? "Retirer le code promo" : "Remove promo code"} className="text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 pt-4 space-y-2 mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t("subtotal")}</span>
          <span className="font-medium">{quote ? formatPriceCents(quote.subtotal_cents, locale) : "..."}</span>
        </div>
        {quote && quote.preparation_fee_cents > 0 && (
          <div className="flex justify-between text-sm"><span className="text-gray-600">{t("deliveryFee")}</span><span className="font-medium">{formatPriceCents(quote.preparation_fee_cents, locale)}</span></div>
        )}
        {quote && quote.discount_cents > 0 && (
          <div className="flex justify-between text-sm text-green-600"><span>Reduction</span><span>-{formatPriceCents(quote.discount_cents, locale)}</span></div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>{t("total")}</span><span className="text-primary-600">{quote ? formatPriceCents(quote.total_cents, locale) : "..."}</span>
        </div>
      </div>
    </>
  );
}
