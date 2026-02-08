import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

// PATCH - Mettre à jour un coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    // Vérifier si le coupon existe
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("id, code")
      .eq("id", id)
      .single();

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const { data: duplicateCoupon } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", code.toUpperCase())
        .single();

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: "A coupon with this code already exists" },
          { status: 400 }
        );
      }
    }

    const couponData: any = {};
    
    if (code !== undefined) couponData.code = code.toUpperCase();
    if (description !== undefined) couponData.description = description || null;
    if (discount_type !== undefined) couponData.discount_type = discount_type;
    if (discount_value !== undefined) couponData.discount_value = parseFloat(discount_value);
    if (min_order_amount !== undefined) couponData.min_order_amount = parseFloat(min_order_amount) || 0;
    if (max_discount_amount !== undefined) couponData.max_discount_amount = max_discount_amount ? parseFloat(max_discount_amount) : null;
    if (starts_at !== undefined) couponData.starts_at = starts_at;
    if (expires_at !== undefined) couponData.expires_at = expires_at || null;
    if (usage_limit !== undefined) couponData.usage_limit = usage_limit ? parseInt(usage_limit) : null;
    if (is_first_order_only !== undefined) couponData.is_first_order_only = is_first_order_only === true;
    if (is_active !== undefined) couponData.is_active = is_active !== false;

    const { data, error } = await supabase
      .from("coupons")
      .update(couponData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ce code promo existe déjà." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
