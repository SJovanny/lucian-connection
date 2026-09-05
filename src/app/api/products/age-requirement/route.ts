import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productIds: string[] = Array.isArray(body.product_ids)
      ? [...new Set((body.product_ids as unknown[]).filter((id): id is string => typeof id === "string"))]
      : [];

    if (productIds.length === 0) return NextResponse.json({ containsAlcohol: false });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, is_alcoholic")
      .in("id", productIds)
      .eq("is_active", true);

    if (error) throw error;
    return NextResponse.json({ containsAlcohol: (data || []).some((product) => product.is_alcoholic) });
  } catch (error) {
    console.error("[age-requirement] Error:", error);
    return NextResponse.json({ error: "Unable to check product age requirements" }, { status: 500 });
  }
}
