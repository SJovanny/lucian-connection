import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating product stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
