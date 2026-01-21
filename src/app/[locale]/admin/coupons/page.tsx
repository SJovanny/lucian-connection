import { createClient } from "@/lib/supabase/server";
import { CouponsWrapper } from "./wrapper";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { Plus } from "lucide-react";

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Coupons</h1>
          <p className="text-gray-500 mt-1">Gérez vos codes promotionnels.</p>
        </div>
        <Link href="/admin/coupons/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau Coupon
          </Button>
        </Link>
      </div>

      <CouponsWrapper coupons={coupons || []} />
    </div>
  );
}


