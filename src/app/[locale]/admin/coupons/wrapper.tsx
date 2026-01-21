"use client";

import { createClient } from "@/lib/supabase/client";
import { CouponsTable } from "@/components/admin/CouponsTable";
import { useRouter } from "next/navigation";

export function CouponsWrapper({ coupons }: { coupons: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce coupon ?")) {
      const supabase = createClient();
      await supabase.from("coupons").delete().eq("id", id);
      router.refresh();
    }
  };

  return <CouponsTable coupons={coupons} onDelete={handleDelete} />;
}
