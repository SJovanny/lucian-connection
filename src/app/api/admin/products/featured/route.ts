import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client for this route (without strict types to allow updates)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// POST /api/admin/products/featured - Toggle featured status
export async function POST(request: NextRequest) {
  try {
    const { productId, isFeatured } = await request.json();

    if (!productId || typeof isFeatured !== "boolean") {
      return NextResponse.json(
        { error: "productId and isFeatured are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

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
      console.error("Error updating product:", error);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error("Error in featured API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/featured - Get all products with featured status
export async function GET() {
  try {
    const supabase = getAdminClient();

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
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: data });
  } catch (error) {
    console.error("Error in featured API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
