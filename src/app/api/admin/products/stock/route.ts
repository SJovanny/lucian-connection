import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { stockUpdateSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, stock } = await readBoundedJson(request, stockUpdateSchema);

    const { data: existingProduct } = await supabase
      .from("products")
      .select("stock, translations")
      .eq("id", productId)
      .single();

    const { data, error } = await supabase
      .from("products")
      .update({ stock })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      safeLogError("Error updating product stock", error);
      return NextResponse.json(
        { error: "Failed to update product stock" },
        { status: 500 }
      );
    }

    await recordAudit(supabase, {
      action: "product.stock_adjusted",
      entityType: "product",
      entityId: productId,
      summary: `Stock ajusté : ${data.translations.fr.name}`,
      changes: [{ field: "stock", old: existingProduct?.stock ?? null, new: stock }],
    });

    return NextResponse.json(data);
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error updating product stock", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
