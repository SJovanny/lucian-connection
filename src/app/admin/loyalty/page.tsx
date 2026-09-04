import { createClient } from "@/lib/supabase/server";
import { LoyaltyRewardsManager } from "@/components/admin/LoyaltyRewardsManager";

export default async function AdminLoyaltyPage() {
  const supabase = await createClient();
  const [{ data: rewards }, { data: profiles }, { data: settings }] = await Promise.all([
    supabase.from("loyalty_rewards").select("*").order("points_cost"),
    supabase.from("profiles").select("loyalty_points_balance"),
    supabase.from("store_settings").select("id, loyalty_points_per_euro").limit(1).maybeSingle(),
  ]);
  const circulation = (profiles || []).reduce((sum, profile) => sum + Number(profile.loyalty_points_balance || 0), 0);
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900 font-display">Fidélité</h1><p className="mt-1 text-gray-500">Gérez les récompenses et consultez les points en circulation.</p></div><div className="grid sm:grid-cols-2 gap-4"><div className="rounded-lg bg-white border border-gray-200 p-5"><p className="text-sm text-gray-500">Points en circulation</p><p className="text-3xl font-bold text-primary-700">{circulation}</p></div><div className="rounded-lg bg-white border border-gray-200 p-5"><p className="text-sm text-gray-500">Taux actuel</p><p className="text-3xl font-bold text-primary-700">{settings?.loyalty_points_per_euro || 1} pt / €</p></div></div><LoyaltyRewardsManager initialRewards={(rewards || []) as never[]} settingsId={settings?.id} initialRate={Number(settings?.loyalty_points_per_euro || 1)} /></div>;
}
