import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

// GET - Récupérer tous les coupons
export async function GET(request: NextRequest) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau coupon
export async function POST(request: NextRequest) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      starts_at,
      expires_at,
      usage_limit,
      is_first_order_only,
      is_active,
    } = body;

    // Validation basique
    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, discount_type, discount_value" },
        { status: 400 }
      );
    }

    // Vérifier si le code existe déjà
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (existingCoupon) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 400 }
      );
    }

    const couponData = {
      code: code.toUpperCase(),
      description: description || null,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_order_amount: parseFloat(min_order_amount) || 0,
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
      starts_at: starts_at || new Date().toISOString(),
      expires_at: expires_at || null,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      is_first_order_only: is_first_order_only === true,
      is_active: is_active !== false,
    };

    const { data, error } = await supabase
      .from("coupons")
      .insert(couponData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ce code promo existe déjà." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
