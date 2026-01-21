import { createClient } from "@/lib/supabase/server";
import { CouponForm } from "@/components/admin/CouponForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage(props: PageProps) {
  const params = await props.params;
  const supabase = createClient();
  
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!coupon) {
    notFound();
  }

  return <CouponForm initialData={coupon} isEdit />;
}
