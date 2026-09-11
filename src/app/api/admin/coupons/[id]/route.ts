import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { CouponRuleError, normalizeCouponData } from "@/lib/coupon-rules";
import { diffFields, recordAudit } from "@/lib/audit";
import type { Coupon } from "@/types/database.types";
import { couponInputSchema, uuidSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

// PATCH - Mettre à jour un coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const body = await readBoundedJson(request, couponInputSchema);

    // Vérifier si le coupon existe
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    let couponData;
    try {
      couponData = normalizeCouponData(body, existingCoupon);
    } catch (error) {
      if (error instanceof CouponRuleError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (couponData.code !== existingCoupon.code) {
      const { data: duplicateCoupon } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", couponData.code)
        .single();

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: "A coupon with this code already exists" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("coupons")
      .update(couponData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const changes = diffFields(existingCoupon as Coupon, data as Coupon, [
      "code",
      "description",
      "discount_type",
      "discount_value",
      "min_order_amount",
      "max_discount_amount",
      "starts_at",
      "expires_at",
      "usage_limit",
      "is_first_order_only",
      "is_active",
    ]);
    await recordAudit(supabase, {
      action: "coupon.updated",
      entityType: "coupon",
      entityId: id,
      summary: `Coupon modifié : ${data.code}`,
      changes,
    });

    return NextResponse.json(data);
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error updating coupon", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
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
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("code")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await recordAudit(supabase, {
      action: "coupon.deleted",
      entityType: "coupon",
      entityId: id,
      summary: `Coupon supprimé : ${existingCoupon?.code ?? id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    safeLogError("Error deleting coupon", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
