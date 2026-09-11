import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productIdsSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

export async function POST(request: NextRequest) {
  try {
    const body = await readBoundedJson(request, productIdsSchema);
    const productIds = [...new Set(body.product_ids)];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, is_alcoholic")
      .in("id", productIds)
      .eq("is_active", true);

    if (error) throw error;
    return NextResponse.json({ containsAlcohol: (data || []).some((product) => product.is_alcoholic) });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("[age-requirement] Error", error);
    return NextResponse.json({ error: "Unable to check product age requirements" }, { status: 500 });
  }
}
