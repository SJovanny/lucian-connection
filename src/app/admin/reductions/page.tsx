import { createClient } from "@/lib/supabase/server";
import { ReductionsWrapper } from "./wrapper";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminReductionsPage() {
  const supabase = await createClient();

  const { data: reductions } = await supabase
    .from("reductions")
    .select("*")
    .order("priority", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Réductions</h1>
          <p className="text-gray-500 mt-1">Gérez vos réductions sur les produits et catégories.</p>
        </div>
        <Link href="/admin/reductions/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle Réduction
          </Button>
        </Link>
      </div>

      <ReductionsWrapper reductions={reductions || []} />
    </div>
  );
}
