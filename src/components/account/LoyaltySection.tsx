"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useLoyalty, type LoyaltyData } from "@/lib/client/useLoyalty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { LoyaltyLedgerEntry } from "@/types/database.types";
import { Check, ChevronLeft, ChevronRight, LockKeyhole, Sparkles } from "lucide-react";

const HISTORY_PREVIEW_COUNT = 5;
const HISTORY_MODAL_PAGE_SIZE = 10;

function useLoyaltyFormatting() {
  const locale = useLocale();
  return {
    number: (value: number) => new Intl.NumberFormat(locale).format(value),
    currency: (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value),
    percent: (value: number) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(value / 100),
    date: (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value)),
  };
}

function ErrorNotice({ message, retry, retryLabel, loading }: {
  message: string;
  retry: () => void;
  retryLabel: string;
  loading: boolean;
}) {
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      <p>{message}</p>
      <Button className="mt-2" size="sm" onClick={retry} disabled={loading} isLoading={loading}>
        {retryLabel}
      </Button>
    </div>
  );
}

function LoyaltyCoupons({ redemptions }: { redemptions: LoyaltyData["redemptions"] }) {
  const { date, number } = useLoyaltyFormatting();
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">Mes bons de réduction</h3>
      {redemptions.length ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {redemptions.map((redemption) => (
            <div key={redemption.id} className="rounded-lg border border-gray-200 p-3 text-sm">
              <p className="font-medium text-gray-900">{redemption.coupons?.code || "Bon fidélité"}</p>
              <p className="text-gray-500">Obtenu le {date(redemption.created_at)} · {number(redemption.points_spent)} points</p>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-gray-500">Aucun bon obtenu pour le moment.</p>}
    </div>
  );
}

function LedgerRow({ entry }: { entry: LoyaltyLedgerEntry }) {
  const { date, number } = useLoyaltyFormatting();
  return (
    <div className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm">
      <div>
        <p className="text-gray-900">{entry.description}</p>
        <p className="text-gray-500">{date(entry.created_at)}</p>
      </div>
      <span className={entry.points > 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
        {entry.points > 0 ? "+" : ""}{number(entry.points)}
      </span>
    </div>
  );
}

export function LoyaltySection() {
  const { data, loading, loadError, redeeming, redeemError, couponCode, load, redeem } = useLoyalty();
  const locale = useLocale();
  const { currency, number, percent } = useLoyaltyFormatting();
  const en = locale === "en";
  const retryLabel = en ? "Retry" : "Réessayer";
  const loadingLabel = en ? "Loading your loyalty account…" : "Chargement de votre fidélité…";
  const loadErrorMessage = en
    ? "Unable to refresh your loyalty account. Check your connection and retry to see your current points and coupons."
    : "Impossible d’actualiser votre fidélité. Vérifiez votre connexion et réessayez pour voir vos points et bons à jour.";
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const openHistoryModal = () => {
    setHistoryPage(1);
    setShowHistoryModal(true);
  };

  if (!data) return (
    <Card><CardContent>
      {loading ? <p role="status" className="text-gray-500">{loadingLabel}</p> : (
        <ErrorNotice message={loadErrorMessage} retry={load} retryLabel={retryLabel} loading={loading} />
      )}
    </CardContent></Card>
  );
  const ledger = data.ledger.slice(0, HISTORY_PREVIEW_COUNT);
  const hasMoreHistory = data.ledger.length > HISTORY_PREVIEW_COUNT;
  const totalHistoryPages = Math.max(1, Math.ceil(data.ledger.length / HISTORY_MODAL_PAGE_SIZE));
  const paginatedLedger = data.ledger.slice((historyPage - 1) * HISTORY_MODAL_PAGE_SIZE, historyPage * HISTORY_MODAL_PAGE_SIZE);
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
          <div><p className="text-sm text-primary-100">Solde disponible</p><p className="text-4xl font-bold">{number(data.balance)} points</p></div>
          <p className="text-sm text-primary-100">{currency(1)} dépensé sur les produits = 1 point</p>
        </div>
        {couponCode && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {en ? `Your coupon ${couponCode} is available in your account.` : `Votre bon ${couponCode} est disponible dans votre compte.`}
        </p>}
        {loading && <p role="status" className="text-sm text-gray-500">{loadingLabel}</p>}
        {loadError && <ErrorNotice message={loadErrorMessage} retry={load} retryLabel={retryLabel} loading={loading} />}
        {redeemError && <ErrorNotice
          message={en
            ? "Unable to confirm the redemption. Check your connection and refresh your points and coupons before trying to redeem again."
            : "Impossible de confirmer l’échange. Vérifiez votre connexion et actualisez vos points et bons avant de retenter l’échange."}
          retry={load}
          retryLabel={en ? "Refresh points and coupons" : "Actualiser les points et bons"}
          loading={loading || redeeming !== null}
        />}
        <div className="border-y border-gray-200 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Vos paliers</p><h3 className="mt-1 text-xl font-bold text-gray-900">Votre progression fidélité</h3></div>
            {nextReward ? <p className="text-sm text-gray-600">Encore <strong className="text-primary-700">{number(nextReward.points_cost - data.balance)} points</strong> pour {nextReward.name}</p> : <p className="text-sm font-medium text-accent-700">Tous les paliers sont débloqués</p>}
          </div>
          {rewards.length === 0 ? (
            <p className="text-sm text-gray-500">Les récompenses seront bientôt disponibles.</p>
          ) : (
            <>
              {/* Mobile: vertical stacked steps (no horizontal scroll) */}
              <div className="flex flex-col gap-2 sm:hidden">
                {rewards.map((reward) => {
                  const unlocked = data.balance >= reward.points_cost;
                  const current = nextReward?.id === reward.id;
                  return (
                    <div
                      key={reward.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        current ? "border-primary-300 bg-primary-50" : "border-gray-100"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          unlocked
                            ? "bg-accent-400 text-primary-900"
                            : current
                            ? "bg-primary-700 text-white ring-4 ring-primary-100"
                            : "bg-primary-100 text-primary-400"
                        }`}
                      >
                        {unlocked ? (
                          <Check className="h-4 w-4" />
                        ) : current ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <LockKeyhole className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">{reward.name}</p>
                        <p className="text-xs text-gray-500">
                          {number(reward.points_cost)} pts ·{" "}
                          {reward.discount_type === "percentage"
                            ? percent(reward.discount_value)
                            : currency(reward.discount_value)}
                        </p>
                      </div>
                      {unlocked && (
                        <Button
                          size="sm"
                          className="shrink-0"
                          disabled={redeeming !== null || loading || loadError}
                          isLoading={redeeming === reward.id}
                          onClick={() => redeem(reward.id)}
                        >
                          Échanger
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop/tablet: horizontal timeline */}
              <div className="hidden overflow-x-auto pb-2 sm:block">
                <div className="relative flex min-w-[620px] items-start px-3 sm:px-8">
                  <div className="absolute left-10 right-10 top-5 h-1 rounded-full bg-primary-100" aria-hidden="true">
                    <div className="h-full rounded-full bg-accent-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  {rewards.map((reward, index) => {
                    const unlocked = data.balance >= reward.points_cost;
                    const current = nextReward?.id === reward.id;
                    return (
                      <div key={reward.id} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
                        <div
                          className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${
                            unlocked
                              ? "bg-accent-400 text-primary-900"
                              : current
                              ? "bg-primary-700 text-white ring-4 ring-primary-100"
                              : "bg-primary-100 text-primary-400"
                          }`}
                        >
                          {unlocked ? (
                            <Check className="h-4 w-4" />
                          ) : current ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <LockKeyhole className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <p className="mt-3 text-sm font-bold text-gray-900">{number(reward.points_cost)} pts</p>
                        <p className="mt-1 max-w-[120px] text-xs font-medium text-gray-700">{reward.name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {reward.discount_type === "percentage"
                            ? percent(reward.discount_value)
                            : currency(reward.discount_value)}
                        </p>
                        {unlocked && (
                          <Button
                            className="mt-3"
                            size="sm"
                            disabled={redeeming !== null || loading || loadError}
                            isLoading={redeeming === reward.id}
                            onClick={() => redeem(reward.id)}
                          >
                            Échanger
                          </Button>
                        )}
                        {index < rewards.length - 1 && <span className="sr-only">Étape suivante</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Historique des points</h3>
          <div className="space-y-2">
            {ledger.length === 0 ? <p className="text-sm text-gray-500">Aucun mouvement.</p> : ledger.map((entry) => <LedgerRow key={entry.id} entry={entry} />)}
          </div>
          {hasMoreHistory && (
            <button
              type="button"
              onClick={openHistoryModal}
              className="mt-3 text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Voir tout l&apos;historique ({number(data.ledger.length)})
            </button>
          )}
        </div>
        <LoyaltyCoupons redemptions={data.redemptions} />
      </CardContent>
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Historique des points" size="lg">
        <div className="space-y-2">
          {paginatedLedger.map((entry) => <LedgerRow key={entry.id} entry={entry} />)}
        </div>
        {totalHistoryPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            <span className="text-sm text-gray-500">Page {number(historyPage)} / {number(totalHistoryPages)}</span>
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
              disabled={historyPage === totalHistoryPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Modal>
    </Card>
  );
}
