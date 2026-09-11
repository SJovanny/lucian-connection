"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useCartStore } from "@/store/cartStore";
import { LegalPage } from "@/components/legal/LegalPage";
import { Link } from "@/i18n/routing";

type Status = "pending" | "waiting" | "paid" | "partially_refunded" | "refunded" | "failed" | "unauthorized" | "invalid" | "error";

const messages: Record<Status, { fr: [string, string]; en: [string, string] }> = {
  pending: { fr: ["Vérification du paiement", "Nous attendons la confirmation de votre paiement."], en: ["Checking payment", "We are waiting for confirmation of your payment."] },
  waiting: { fr: ["Paiement en attente", "La confirmation prend plus de temps. Consultez vos commandes pour vérifier son état."], en: ["Payment pending", "Confirmation is taking longer. Check your orders for the latest status."] },
  paid: { fr: ["Paiement confirmé", "Votre commande a été enregistrée. Nous vous attendons au magasin pendant le créneau choisi."], en: ["Payment confirmed", "Your order has been recorded. We will be ready for you at the store during your selected pickup slot."] },
  partially_refunded: { fr: ["Paiement partiellement remboursé", "Consultez vos commandes pour les détails du remboursement."], en: ["Payment partially refunded", "View your orders for refund details."] },
  refunded: { fr: ["Paiement remboursé", "Votre paiement a été remboursé. Consultez vos commandes pour les détails."], en: ["Payment refunded", "Your payment has been refunded. View your orders for details."] },
  failed: { fr: ["Paiement non confirmé", "Le paiement a échoué ou a été annulé. Consultez vos commandes."], en: ["Payment not confirmed", "The payment failed or was cancelled. Please check your orders."] },
  unauthorized: { fr: ["Connexion requise", "Connectez-vous à votre compte pour vérifier votre paiement."], en: ["Sign in required", "Sign in to your account to check your payment."] },
  invalid: { fr: ["Lien de paiement invalide", "Ce lien ne permet pas de vérifier votre paiement. Consultez vos commandes."], en: ["Invalid payment link", "This link cannot verify your payment. Please check your orders."] },
  error: { fr: ["Vérification indisponible", "Impossible de vérifier votre paiement. Veuillez consulter vos commandes ou réessayer plus tard."], en: ["Verification unavailable", "Unable to verify your payment. Please check your orders or try again later."] },
};

function CheckoutSuccessContent() {
  const locale = useLocale();
  const query = useSearchParams().toString();
  const [result, setResult] = useState<{ query: string; status: Status } | null>(null);
  const status = result?.query === query ? result.status : "pending";

  useEffect(() => {
    const setStatus = (status: Status) => setResult({ query, status });
    const ids = new URLSearchParams(query).getAll("session_id");
    const sessionId = ids[0];
    const controller = new AbortController();
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function check() {
      if (ids.length !== 1 || !sessionId || sessionId.length > 255 || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
        setStatus("invalid");
        return;
      }
      try {
        attempts += 1;
        const response = await fetch(`/api/payments/status?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store", credentials: "same-origin", signal: controller.signal,
        });
        if (stopped) return;
        if (!response.ok) {
          setStatus(response.status === 401 ? "unauthorized" : response.status === 400 || response.status === 404 ? "invalid" : "error");
          return;
        }
        const data = await response.json();
        if (stopped) return;
        if (!data || typeof data.order_id !== "string" || !data.order_id) throw new Error("Invalid status response");
        switch (data.payment_status) {
          case "paid": {
            setStatus("paid");
            // Only the cart submitted for this session may be cleared. Consume the
            // snapshot even on mismatch so returning later cannot clear a new cart.
            const snapshotKey = `checkout-cart-snapshot:${sessionId}`;
            try {
              const snapshot = sessionStorage.getItem(snapshotKey);
              sessionStorage.removeItem(snapshotKey);
              if (snapshot && snapshot === JSON.stringify(useCartStore.getState().items)) {
                useCartStore.getState().clearCart();
              }
            } catch { /* Cart preservation does not affect payment confirmation. */ }
            return;
          }
          case "partially_refunded":
          case "refunded": setStatus(data.payment_status); return;
          case "payment_failed":
          case "cancelled": setStatus("failed"); return;
          case "pending_payment":
            if (attempts < 6) timer = setTimeout(check, 2000);
            else setStatus("waiting");
            return;
          default: throw new Error("Unknown payment status");
        }
      } catch {
        if (!stopped) setStatus("error");
      }
    }
    void check();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const [title, description] = messages[status][locale === "fr" ? "fr" : "en"];
  return (
    <LegalPage title={title}>
      <p role="status" aria-live="polite">{description}</p>
      <Link href="/account" className="inline-block rounded-lg bg-primary-700 px-4 py-2 font-medium text-white">
        {locale === "fr" ? "Voir mes commandes" : "View my orders"}
      </Link>
    </LegalPage>
  );
}

function CheckoutSuccessFallback() {
  const locale = useLocale();
  const [title, description] = messages.pending[locale === "fr" ? "fr" : "en"];
  return <LegalPage title={title}><p role="status">{description}</p></LegalPage>;
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<CheckoutSuccessFallback />}><CheckoutSuccessContent /></Suspense>;
}
