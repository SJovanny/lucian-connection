import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { featuredProductSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

// POST /api/admin/products/featured - Toggle featured status
export async function POST(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, isFeatured } = await readBoundedJson(request, featuredProductSchema);

    const { data, error } = await supabase
      .from("products")
      .update({
        is_featured: isFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      safeLogError("Error updating product", error);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    await recordAudit(supabase, {
      action: "product.featured_toggled",
      entityType: "product",
      entityId: productId,
      summary: `Mise en avant ${isFeatured ? "activée" : "désactivée"} : ${data.translations.fr.name}`,
      changes: [{ field: "is_featured", old: !isFeatured, new: isFeatured }],
    });

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error in featured API", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/featured - Get all products with featured status
export async function GET(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (*)
      `)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("translations->fr->>name", { ascending: true });

    if (error) {
      safeLogError("Error fetching featured products", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: data });
  } catch (error) {
    safeLogError("Error in featured API", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
