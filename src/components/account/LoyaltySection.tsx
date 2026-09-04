"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { LoyaltyLedgerEntry, LoyaltyReward } from "@/types/database.types";
import { Check, LockKeyhole, Sparkles } from "lucide-react";

type Payment = { id: string; subtotal: number; total_amount: number; created_at: string; payment_status: string };
type LoyaltyData = { balance: number; ledger: LoyaltyLedgerEntry[]; rewards: LoyaltyReward[]; payments: Payment[]; redemptions: Array<{ id: string; created_at: string; points_spent: number; coupons?: { code: string } | null }> };

const currency = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));

export function LoyaltySection() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/loyalty");
    if (response.ok) setData(await response.json());
    setLoading(false);
  };

  useEffect(() => {
    // Load the account data once after the client component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const redeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    setMessage(null);
    const response = await fetch("/api/loyalty/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reward_id: rewardId }) });
    if (response.ok) {
      const result = await response.json();
      setMessage(`Votre bon ${result.coupon_code} est disponible dans votre compte.`);
      await load();
    } else {
      setMessage("Impossible d'échanger cette récompense.");
    }
    setRedeeming(null);
  };

  if (loading) return <Card><CardContent><p className="text-gray-500">Chargement de votre fidélité...</p></CardContent></Card>;
  if (!data) return null;
  const payments = data.payments.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const ledger = data.ledger.slice(0, 8);
  const rewards = data.rewards.slice().sort((a, b) => a.points_cost - b.points_cost);
  const nextReward = rewards.find((reward) => reward.points_cost > data.balance);
  const progress = rewards.length && nextReward
    ? Math.min(100, Math.max(0, (data.balance / rewards[rewards.length - 1].points_cost) * 100))
    : 100;

  return (
    <Card className="lg:col-span-3">
      <CardHeader><CardTitle>Ma fidélité</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl bg-primary-700 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><p className="text-sm text-primary-100">Solde disponible</p><p className="text-4xl font-bold">{data.balance} points</p></div>
          <p className="text-sm text-primary-100">1 € dépensé sur les produits = 1 point</p>
        </div>
        {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <div className="border-y border-gray-200 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Vos paliers</p><h3 className="mt-1 text-xl font-bold text-gray-900">Votre progression fidélité</h3></div>
            {nextReward ? <p className="text-sm text-gray-600">Encore <strong className="text-primary-700">{nextReward.points_cost - data.balance} points</strong> pour {nextReward.name}</p> : <p className="text-sm font-medium text-accent-700">Tous les paliers sont débloqués</p>}
          </div>
          {rewards.length === 0 ? <p className="text-sm text-gray-500">Les récompenses seront bientôt disponibles.</p> : <div className="overflow-x-auto pb-2"><div className="relative flex min-w-[620px] items-start px-3 sm:px-8">
            <div className="absolute left-10 right-10 top-5 h-1 rounded-full bg-primary-100" aria-hidden="true"><div className="h-full rounded-full bg-accent-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
            {rewards.map((reward, index) => { const unlocked = data.balance >= reward.points_cost; const current = nextReward?.id === reward.id; return <div key={reward.id} className="relative flex min-w-0 flex-1 flex-col items-center text-center"><div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${unlocked ? "bg-accent-400 text-primary-900" : current ? "bg-primary-700 text-white ring-4 ring-primary-100" : "bg-primary-100 text-primary-400"}`}>{unlocked ? <Check className="h-4 w-4" /> : current ? <Sparkles className="h-4 w-4" /> : <LockKeyhole className="h-3.5 w-3.5" />}</div><p className="mt-3 text-sm font-bold text-gray-900">{reward.points_cost} pts</p><p className="mt-1 max-w-[120px] text-xs font-medium text-gray-700">{reward.name}</p><p className="mt-1 text-xs text-gray-500">{reward.discount_type === "percentage" ? `${reward.discount_value}%` : currency(reward.discount_value)}</p>{unlocked && <Button className="mt-3" size="sm" disabled={redeeming !== null} isLoading={redeeming === reward.id} onClick={() => redeem(reward.id)}>Échanger</Button>}{index < rewards.length - 1 && <span className="sr-only">Étape suivante</span>}</div>; })}
          </div></div>}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div><h3 className="font-semibold text-gray-900 mb-3">Derniers paiements et points</h3><div className="space-y-2">{payments.length === 0 ? <p className="text-sm text-gray-500">Aucun paiement enregistré.</p> : payments.map((payment) => { const entry = data.ledger.find((item) => item.order_id === payment.id && item.type === "earn"); return <div key={payment.id} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm"><div><p className="text-gray-900">Commande #{payment.id.slice(0, 8)}</p><p className="text-gray-500">{date(payment.created_at)} · {currency(payment.subtotal)} de produits</p></div><span className="font-semibold text-primary-700">+{entry?.points || 0} pts</span></div>; })}</div></div>
          <div><h3 className="font-semibold text-gray-900 mb-3">Historique des points</h3><div className="space-y-2">{ledger.length === 0 ? <p className="text-sm text-gray-500">Aucun mouvement.</p> : ledger.map((entry) => <div key={entry.id} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm"><div><p className="text-gray-900">{entry.description}</p><p className="text-gray-500">{date(entry.created_at)}</p></div><span className={entry.points > 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>{entry.points > 0 ? "+" : ""}{entry.points}</span></div>)}</div></div>
        </div>
        <div><h3 className="font-semibold text-gray-900 mb-3">Mes bons de réduction</h3>{data.redemptions.length ? <div className="grid sm:grid-cols-2 gap-3">{data.redemptions.map((redemption) => <div key={redemption.id} className="rounded-lg border border-gray-200 p-3 text-sm"><p className="font-medium text-gray-900">{redemption.coupons?.code || "Bon fidélité"}</p><p className="text-gray-500">Obtenu le {date(redemption.created_at)} · {redemption.points_spent} points</p></div>)}</div> : <p className="text-sm text-gray-500">Aucun bon obtenu pour le moment.</p>}</div>
      </CardContent>
    </Card>
  );
}
