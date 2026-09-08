import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, stock } = await request.json();

    if (!productId || typeof stock !== "number") {
      return NextResponse.json(
        { error: "Product ID and stock are required" },
        { status: 400 }
      );
    }

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
      console.error("Error updating product stock:", error);
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
    console.error("Error updating product stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
