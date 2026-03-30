import { createClient } from "@/lib/supabase/server";
import { ReductionForm } from "@/components/admin/ReductionForm";
import { notFound } from "next/navigation";
import type { Reduction } from "@/types/database.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReductionPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: reduction } = await supabase
    .from("reductions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!reduction) {
    notFound();
  }

  return <ReductionForm initialData={reduction as Reduction} isEdit />;
}
