import { NextRequest, NextResponse } from "next/server";
import { updateProductStock } from "@/lib/supabase/queries";
import { verifyAdminAuth } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth();
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { productId, stock } = await request.json();

    if (!productId || typeof stock !== "number") {
      return NextResponse.json(
        { error: "Product ID and stock are required" },
        { status: 400 }
      );
    }

    const updatedProduct = await updateProductStock(productId, stock);

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Failed to update product stock" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
