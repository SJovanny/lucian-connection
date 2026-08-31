"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ArrowLeft, Check, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Locale } from "@/i18n/routing";

export default function CheckoutPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Settings & Fees
  const [preparationFee, setPreparationFee] = useState(0);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    id: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.preparation_fee) setPreparationFee(Number(data.preparation_fee));
      })
      .catch((err) => console.error("Failed to fetch settings", err));
  }, []);

  const subtotal = getSubtotal();
  const totalBeforeDiscount = subtotal + preparationFee;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, totalBeforeDiscount - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError(null);
    setAppliedCoupon(null);

    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderTotal: subtotal // Discount usually applies to subtotal
        }),
      });

      const data = await res.json();

      if (!data.valid) {
        setCouponError(data.message);
      } else {
        setAppliedCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          discount_amount: data.discountAmount
        });
        setCouponCode(""); // Clear input on success
      }
    } catch (error) {
      console.error(error);
      setCouponError("Error validating coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("[checkout] 1) submit clicked");
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const supabase = createClient();
      console.log("[checkout] 2) fetching user session");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("[checkout] 3) user:", user, "authError:", authError);

      if (!user) {
        console.log("[checkout] 4) no user -> redirect /login");
        router.push("/login");
        return;
      }

      const form = e.target as HTMLFormElement;
      console.log("[checkout] 4.5) form element:", form);
      const formData = new FormData(form);
      const full_name = String(formData.get("fullName") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      const payload = {
        items,
        subtotal,
        delivery_fee: preparationFee,
        total_amount: total,
        phone,
        notes,
        locale,
        coupon_id: appliedCoupon?.id || null,
        discount_amount: appliedCoupon?.discount_amount || 0,
        full_name,
        email,
      };

      console.log("[checkout] 5) posting /api/orders with payload:", payload);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[checkout] 6) response status:", res.status);
      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any = null;
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error("[checkout] failed to parse error response", jsonErr);
        }
        console.error("[checkout] Order creation failed:", data);
        setFormError(data?.details || data?.error || "Erreur lors de la création de la commande");
        return;
      }

      setIsSuccess(true);
      clearCart();
      console.log("[checkout] 7) order success, cart cleared");
    } catch (error) {
      console.error("[checkout] unexpected error:", error);
      setFormError("Erreur lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
      console.log("[checkout] 8) submit finished");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("orderSuccess")}
            </h1>
            <p className="text-gray-600 mb-8">{t("orderSuccessMessage")}</p>
            <Link href="/">
              <Button variant="primary" className="w-full">
                {locale === "fr" ? "Retour à l'accueil" : "Back to home"}
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {locale === "fr" ? "Votre panier est vide" : "Your cart is empty"}
            </h1>
            <p className="text-gray-600 mb-6">
              {locale === "fr"
                ? "Ajoutez des produits pour continuer"
                : "Add products to continue"}
            </p>
            <Link href="/products">
              <Button variant="primary">
                {locale === "fr" ? "Voir les produits" : "View products"}
              </Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === "fr" ? "Continuer vos achats" : "Continue shopping"}
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 font-display mb-8">
            {t("title")}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("contactInfo")}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label={t("form.fullName")}
                        name="fullName"
                        required
                        placeholder="John Doe"
                      />
                      <Input
                        label={t("form.email")}
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                      />
                      <Input
                        label={t("form.phone")}
                        name="phone"
                        type="tel"
                        required
                        placeholder="+1 758 555 1234"
                        className="sm:col-span-2"
                      />
                      {formError && (
                        <p className="text-sm text-red-600 sm:col-span-2">
                          {formError}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address - Removed for Click & Collect */}
                {/* 
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("deliveryAddress")}
                    </h2>
                    <div className="space-y-4">
                      <Input
                        label={t("form.address")}
                        name="address"
                        required
                        placeholder="123 Main Street"
                      />
                      <Input
                        label={t("form.city")}
                        name="city"
                        required
                        placeholder="Fort-de-France"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("form.notes")}
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                          placeholder={
                            locale === "fr"
                              ? "Instructions spéciales pour la livraison..."
                              : "Special delivery instructions..."
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card> 
                */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {locale === "fr" ? "Notes" : "Notes"}
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("form.notes")}
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                        placeholder={
                          locale === "fr"
                            ? "Notes pour la commande..."
                            : "Order notes..."
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Order summary */}
              <div>
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {t("orderSummary")}
                    </h2>

                    {/* Items */}
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Code */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {!appliedCoupon ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 block">
                            {locale === "fr" ? "Code promo" : "Promo code"}
                          </label>
                          <div className="flex gap-2">
                            <Input
                              name="coupon"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="CODE123"
                            />
                            <Button
                              type="button"
                              onClick={handleApplyCoupon}
                              variant="secondary"
                              isLoading={isValidatingCoupon}
                              disabled={!couponCode.trim()}
                            >
                              {locale === "fr" ? "Appliquer" : "Apply"}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-red-500 text-xs mt-1">{couponError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="text-green-700 font-medium text-sm">
                              {appliedCoupon.code}
                            </p>
                            <p className="text-green-600 text-xs">
                              -{formatPrice(appliedCoupon.discount_amount)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t("subtotal")}</span>
                        <span className="font-medium">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      {preparationFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {t("deliveryFee")}
                          </span>
                          <span className="font-medium">
                            {formatPrice(preparationFee)}
                          </span>
                        </div>
                      )}

                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Reduction</span>
                          <span>-{formatPrice(appliedCoupon.discount_amount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                        <span>{t("total")}</span>
                        <span className="text-primary-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full mt-6"
                      isLoading={isSubmitting}
                    >
                      {t("placeOrder")}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      {locale === "fr"
                        ? "Paiement à la livraison"
                        : "Pay on delivery"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
