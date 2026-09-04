"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LoyaltyReward } from "@/types/database.types";

export function LoyaltyRewardsManager({ initialRewards, settingsId, initialRate }: { initialRewards: LoyaltyReward[]; settingsId?: string; initialRate: number }) {
  const [rewards, setRewards] = useState(initialRewards);
  const [form, setForm] = useState({ name: "", points_cost: "", discount_type: "fixed", discount_value: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rate, setRate] = useState(String(initialRate));
  const [savingRate, setSavingRate] = useState(false);

  const addReward = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const values = { name: form.name, points_cost: Number(form.points_cost), discount_type: form.discount_type as "fixed" | "percentage", discount_value: Number(form.discount_value), updated_at: new Date().toISOString() };
    const { data, error } = editingId
      ? await supabase.from("loyalty_rewards").update(values).eq("id", editingId).select().single()
      : await supabase.from("loyalty_rewards").insert(values).select().single();
    if (!error && data) { setRewards((items) => (editingId ? items.map((item) => item.id === editingId ? data as LoyaltyReward : item) : [...items, data as LoyaltyReward]).sort((a, b) => a.points_cost - b.points_cost)); setForm({ name: "", points_cost: "", discount_type: "fixed", discount_value: "" }); setEditingId(null); }
    setSaving(false);
  };

  const saveRate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settingsId) return;
    setSavingRate(true);
    const supabase = createClient();
    await supabase.from("store_settings").update({ loyalty_points_per_euro: Number(rate) }).eq("id", settingsId);
    setSavingRate(false);
  };

  const toggle = async (reward: LoyaltyReward) => {
    const supabase = createClient();
    const { data } = await supabase.from("loyalty_rewards").update({ is_active: !reward.is_active, updated_at: new Date().toISOString() }).eq("id", reward.id).select().single();
    if (data) setRewards((items) => items.map((item) => item.id === reward.id ? data as LoyaltyReward : item));
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette récompense ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("loyalty_rewards").delete().eq("id", id);
    if (!error) setRewards((items) => items.filter((item) => item.id !== id));
  };

  const edit = (reward: LoyaltyReward) => {
    setEditingId(reward.id);
    setForm({ name: reward.name, points_cost: String(reward.points_cost), discount_type: reward.discount_type, discount_value: String(reward.discount_value) });
  };

  return <div className="space-y-6">
    <form onSubmit={saveRate} className="rounded-lg bg-white border border-gray-200 p-5 flex flex-wrap items-end gap-3"><label className="text-sm text-gray-700">Points par euro<input required min="0" step="0.01" type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 w-40 h-10 rounded border border-gray-300 px-3" /></label><button disabled={savingRate || !settingsId} className="h-10 rounded bg-primary-600 px-4 text-white disabled:opacity-50">{savingRate ? "Enregistrement..." : "Modifier le taux"}</button></form>
    <form onSubmit={addReward} className="rounded-lg bg-white border border-gray-200 p-5 grid md:grid-cols-5 gap-3 items-end">
      <label className="text-sm text-gray-700">Nom<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full h-10 rounded border border-gray-300 px-3" /></label>
      <label className="text-sm text-gray-700">Coût en points<input required min="1" type="number" value={form.points_cost} onChange={(e) => setForm({ ...form, points_cost: e.target.value })} className="mt-1 w-full h-10 rounded border border-gray-300 px-3" /></label>
      <label className="text-sm text-gray-700">Type<select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="mt-1 w-full h-10 rounded border border-gray-300 px-3"><option value="fixed">Montant fixe</option><option value="percentage">Pourcentage</option></select></label>
      <label className="text-sm text-gray-700">Valeur<input required min="0.01" step="0.01" type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="mt-1 w-full h-10 rounded border border-gray-300 px-3" /></label>
      <button disabled={saving} className="h-10 rounded bg-primary-600 px-4 text-white disabled:opacity-50">{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", points_cost: "", discount_type: "fixed", discount_value: "" }); }} className="h-10 rounded border border-gray-300 px-4 text-gray-700">Annuler</button>}
    </form>
    <div className="overflow-x-auto rounded-lg bg-white border border-gray-200"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-4">Récompense</th><th className="text-left p-4">Coût</th><th className="text-left p-4">Réduction</th><th className="text-left p-4">Statut</th><th className="text-right p-4">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{rewards.map((reward) => <tr key={reward.id}><td className="p-4 font-medium">{reward.name}</td><td className="p-4">{reward.points_cost} points</td><td className="p-4">{reward.discount_type === "percentage" ? `${reward.discount_value}%` : `${reward.discount_value.toFixed(2)} €`}</td><td className="p-4">{reward.is_active ? "Actif" : "Inactif"}</td><td className="p-4 text-right space-x-3"><button onClick={() => edit(reward)} className="text-primary-600">Modifier</button><button onClick={() => toggle(reward)} className="text-primary-600">{reward.is_active ? "Désactiver" : "Activer"}</button><button onClick={() => remove(reward.id)} className="text-red-600">Supprimer</button></td></tr>)}</tbody></table></div>
  </div>;
}
