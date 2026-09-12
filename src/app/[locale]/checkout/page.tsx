"use client";

import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cartStore";
import {
  fetchPricingQuote,
  getPricingErrorMessage,
  PricingQuoteRequestError,
} from "@/lib/client-pricing";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCheckoutContact } from "@/lib/client/useCheckoutContact";
import { useCheckoutQuote } from "@/lib/client/useCheckoutQuote";
import { useCheckoutCoupon } from "@/lib/client/useCheckoutCoupon";
import { useCheckoutAgeRequirement } from "@/lib/client/useCheckoutAgeRequirement";
import { Link, useRouter } from "@/i18n/routing";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Locale } from "@/i18n/routing";
import { PickupSlotPicker } from "@/components/pickup/PickupSlotPicker";
import { PickupLocation } from "@/components/pickup/PickupLocation";

export default function CheckoutPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const router = useRouter();
  const { items } = useCartStore();

  const { authStatus, contactInfo, setContactInfo } = useCheckoutContact();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [pickupAt, setPickupAt] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [availabilityReloadToken, setAvailabilityReloadToken] = useState(0);
  const checkoutAttemptRef = useRef<{ signature: string; key: string } | null>(null);
  const coupon = useCheckoutCoupon(items, locale);
  const { appliedCoupon } = coupon;
  const { quoteKey, setQuoteState, displayQuote, currentQuoteError } = useCheckoutQuote(items, appliedCoupon?.id || null, locale);
  const { status: ageStatus, containsAlcohol, requireAgeConfirmation } = useCheckoutAgeRequirement(items);
  const ageCheckMessage = ageStatus === "error"
    ? locale === "fr" ? "Impossible de vérifier la restriction d’âge. Rechargez la page pour réessayer." : "Unable to check the age requirement. Reload the page to try again."
    : locale === "fr" ? "Vérification de la restriction d’âge…" : "Checking the age requirement…";

  useEffect(() => {
    setPaymentCancelled(new URLSearchParams(window.location.search).get("payment") === "cancelled");
  }, []);

  useEffect(() => {
    if (!containsAlcohol) setAgeConfirmed(false);
  }, [containsAlcohol]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (ageStatus !== "ready") {
      setFormError(ageCheckMessage);
      setIsSubmitting(false);
      return;
    }

    if (!pickupAt) {
      setFormError(locale === "fr" ? "Veuillez choisir un créneau de retrait." : "Please choose a pickup slot.");
      setIsSubmitting(false);
      return;
    }

    if (!acceptedTerms) {
      setFormError(locale === "fr" ? "Veuillez accepter les conditions générales." : "Please accept the terms and conditions.");
      setIsSubmitting(false);
      return;
    }

    if (containsAlcohol && !ageConfirmed) {
      setFormError(locale === "fr" ? "Vous devez confirmer avoir au moins 18 ans pour commander de l’alcool." : "You must confirm that you are at least 18 to order alcohol.");
      setIsSubmitting(false);
      return;
    }

    try {
      const checkoutCartSnapshot = JSON.stringify(items);
      const currentQuote = await fetchPricingQuote({
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        couponId: appliedCoupon?.id || null,
        locale,
      });
      setQuoteState({ key: quoteKey, quote: currentQuote });

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=${encodeURIComponent("/checkout")}`);
        return;
      }

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const full_name = String(formData.get("fullName") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const notes = String(formData.get("notes") || "").trim();

      const payload = {
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        phone,
        notes,
        locale,
        coupon_id: appliedCoupon?.id || null,
        quote_total_cents: currentQuote.total_cents,
        full_name,
        email,
        terms_accepted: acceptedTerms,
        age_confirmed: ageConfirmed,
        pickup_at: pickupAt,
      };
      const requestSignature = JSON.stringify(payload);
      if (checkoutAttemptRef.current?.signature !== requestSignature) {
        const randomPart = globalThis.crypto?.randomUUID?.()
          || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        checkoutAttemptRef.current = {
          signature: requestSignature,
          key: `checkout:${randomPart}`,
        };
      }

      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutAttemptRef.current.key,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status < 500) checkoutAttemptRef.current = null;
        console.error("[checkout] Payment session creation failed:", data);
        if (data?.error === "PRICE_CHANGED" || data?.error === "COUPON_UNAVAILABLE") {
          if (data.quote) setQuoteState({ key: quoteKey, quote: data.quote });
          setFormError(locale === "fr"
            ? "Le total a changé. Vérifiez le récapitulatif avant de réessayer."
            : "The total changed. Review the summary before trying again.");
        } else if (data?.error === "PICKUP_SLOT_UNAVAILABLE") {
          setPickupAt(null);
          setAvailabilityReloadToken((value) => value + 1);
          setFormError(locale === "fr" ? "Ce créneau n'est plus disponible. Choisissez-en un autre." : "This slot is no longer available. Please choose another one.");
        } else if (data?.error === "ALCOHOL_AGE_REQUIRED") {
          setFormError(locale === "fr" ? "La confirmation de majorité est requise pour cette commande." : "Age confirmation is required for this order.");
          requireAgeConfirmation();
          setAgeConfirmed(false);
        } else {
           setFormError(getPricingErrorMessage(data?.error || "CHECKOUT_UNAVAILABLE", data?.details || data?.error, locale));
        }
        return;
      }

       if (!data.url) {
         setFormError(locale === "fr" ? "Le paiement n’est pas disponible." : "Payment is currently unavailable.");
         return;
       }
       if (typeof data.session_id === "string" && data.session_id.length <= 255
         && /^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(data.session_id)) {
         try {
           sessionStorage.setItem(`checkout-cart-snapshot:${data.session_id}`, checkoutCartSnapshot);
          } catch { /* Without a snapshot, the success page preserves the cart. */ }
        }
        checkoutAttemptRef.current = null;
        window.location.assign(data.url);
    } catch (error) {
      console.error("[checkout] unexpected error:", error);
      setFormError(error instanceof PricingQuoteRequestError
        ? getPricingErrorMessage(error.code, error.message, locale)
        : locale === "fr" ? "Erreur lors de la création de la commande" : "Unable to create the order");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <CartDrawer />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full text-center">
            <p className="text-gray-600">{t("checkingAccess")}</p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    const checkoutPath = getSafeRedirectPath("/checkout");
    const loginPath = `/login?next=${encodeURIComponent(checkoutPath)}`;
    const registerPath = `/register?next=${encodeURIComponent(checkoutPath)}`;

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <CartDrawer />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 font-display mb-3">
              {t("accountRequiredTitle")}
            </h1>
            <p className="text-gray-600 mb-6">
              {t("accountRequiredMessage")}
            </p>
            <div className="space-y-3">
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push(loginPath)}
              >
                {t("signIn")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push(registerPath)}
              >
                {t("createAccount")}
              </Button>
            </div>
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

          {paymentCancelled && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {locale === "fr"
                ? "Le paiement n’a pas été finalisé. Votre panier est conservé afin que vous puissiez réessayer."
                : "The payment was not completed. Your cart has been kept so you can try again."}
            </div>
          )}

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
                         value={contactInfo.fullName}
                         onChange={(event) =>
                           setContactInfo((current) => ({
                             ...current,
                             fullName: event.target.value,
                           }))
                         }
                         required
                         placeholder="John Doe"
                       />
                       <Input
                         label={t("form.email")}
                         name="email"
                         type="email"
                         value={contactInfo.email}
                         onChange={(event) =>
                           setContactInfo((current) => ({
                             ...current,
                             email: event.target.value,
                           }))
                         }
                         required
                         placeholder="john@example.com"
                       />
                       <Input
                         label={t("form.phone")}
                         name="phone"
                         type="tel"
                         value={contactInfo.phone}
                         onChange={(event) =>
                           setContactInfo((current) => ({
                             ...current,
                             phone: event.target.value,
                           }))
                         }
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

                <Card>
                  <CardContent className="space-y-6 p-6">
                    <PickupLocation />
                    <PickupSlotPicker
                      locale={locale}
                      value={pickupAt}
                      onChange={(value) => {
                        setPickupAt(value);
                        setFormError(null);
                      }}
                      reloadToken={availabilityReloadToken}
                    />
                  </CardContent>
                </Card>

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
                    <OrderSummary items={items} locale={locale} quote={displayQuote} error={currentQuoteError} coupon={coupon} />

                    <label className="mt-6 flex items-start gap-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        required
                        checked={acceptedTerms}
                        onChange={(event) => setAcceptedTerms(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>
                        {locale === "fr" ? "J’accepte les " : "I accept the "}
                        <Link href="/terms" className="font-medium text-primary-700 underline">
                          {locale === "fr" ? "conditions générales de vente" : "terms and conditions"}
                        </Link>
                        {locale === "fr" ? " et " : " and "}
                        <Link href="/pickup-refunds" className="font-medium text-primary-700 underline">
                          {locale === "fr" ? "la politique de retrait et de remboursement" : "the pickup and refund policy"}
                        </Link>
                        {locale === "fr" ? ". Je reconnais l’obligation de paiement." : ". I acknowledge the payment obligation."}
                      </span>
                    </label>

                    {containsAlcohol && (
                      <label className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                        <input
                          type="checkbox"
                          name="ageConfirmed"
                          required
                          checked={ageConfirmed}
                          onChange={(event) => {
                            setAgeConfirmed(event.target.checked);
                            setFormError(null);
                          }}
                          className="mt-1 h-4 w-4 rounded border-amber-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span>
                          {locale === "fr"
                            ? "Je confirme avoir au moins 18 ans. Une pièce d’identité pourra être demandée lors du retrait."
                            : "I confirm that I am at least 18 years old. ID may be requested at pickup."}
                        </span>
                      </label>
                    )}

                    {ageStatus !== "ready" && (
                      <p role={ageStatus === "error" ? "alert" : "status"} className="mt-4 text-sm text-gray-600">{ageCheckMessage}</p>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full mt-6"
                      isLoading={isSubmitting}
                      disabled={!displayQuote || !!currentQuoteError || ageStatus !== "ready"}
                    >
                      {t("placeOrder")}
                    </Button>

                     <p className="text-xs text-gray-500 text-center mt-4">
                       {locale === "fr"
                         ? "Paiement sécurisé en ligne par Stripe"
                         : "Secure online payment powered by Stripe"}
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
