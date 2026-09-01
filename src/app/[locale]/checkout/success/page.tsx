"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useCartStore } from "@/store/cartStore";
import { LegalPage } from "@/components/legal/LegalPage";
import { Link } from "@/i18n/routing";

export default function CheckoutSuccessPage() {
  const locale = useLocale();
  const clearCart = useCartStore((state) => state.clearCart);
  useEffect(() => clearCart(), [clearCart]);
  return (
    <LegalPage title={locale === "fr" ? "Paiement confirmé" : "Payment confirmed"}>
      <p>{locale === "fr" ? "Votre commande a été enregistrée. Nous vous attendons au magasin pendant le créneau choisi." : "Your order has been recorded. We will be ready for you at the store during your selected pickup slot."}</p>
      <Link href="/account" className="inline-block rounded-lg bg-primary-700 px-4 py-2 font-medium text-white">
        {locale === "fr" ? "Voir mes commandes" : "View my orders"}
      </Link>
    </LegalPage>
  );
}
