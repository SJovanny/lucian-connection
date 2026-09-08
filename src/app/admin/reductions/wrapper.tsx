"use client";

import { createClient } from "@/lib/supabase/client";
import { ReductionsTable } from "@/components/admin/ReductionsTable";
import { useRouter } from "next/navigation";
import { recordAuditClient } from "@/lib/audit-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReductionsWrapper({ reductions }: { reductions: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réduction ?")) {
      const supabase = createClient();
      const deletedReduction = reductions.find((reduction) => reduction.id === id);
      await supabase.from("reductions").delete().eq("id", id);
      await recordAuditClient(supabase, {
        action: "reduction.deleted",
        entityType: "reduction",
        entityId: id,
        summary: `Réduction supprimée : ${deletedReduction?.name ?? id}`,
      });
      router.refresh();
    }
  };

  return <ReductionsTable reductions={reductions} onDelete={handleDelete} />;
}
