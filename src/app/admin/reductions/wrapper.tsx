"use client";

import { createClient } from "@/lib/supabase/client";
import { ReductionsTable } from "@/components/admin/ReductionsTable";
import { useRouter } from "next/navigation";

export function ReductionsWrapper({ reductions }: { reductions: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réduction ?")) {
      const supabase = createClient();
      await supabase.from("reductions").delete().eq("id", id);
      router.refresh();
    }
  };

  return <ReductionsTable reductions={reductions} onDelete={handleDelete} />;
}
