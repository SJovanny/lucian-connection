"use client";

import { createClient } from "@/lib/supabase/client";
import { CouponsTable } from "@/components/admin/CouponsTable";
import { useRouter } from "next/navigation";
import { recordAuditClient } from "@/lib/audit-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CouponsWrapper({ coupons }: { coupons: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce coupon ?")) {
      const supabase = createClient();
      const deletedCoupon = coupons.find((coupon) => coupon.id === id);
      await supabase.from("coupons").delete().eq("id", id);
      await recordAuditClient(supabase, {
        action: "coupon.deleted",
        entityType: "coupon",
        entityId: id,
        summary: `Coupon supprimé : ${deletedCoupon?.code ?? id}`,
      });
      router.refresh();
    }
  };

  return <CouponsTable coupons={coupons} onDelete={handleDelete} />;
}
