import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { CouponRuleError, normalizeCouponData } from "@/lib/coupon-rules";
import { recordAudit } from "@/lib/audit";
import { couponInputSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

// GET - Récupérer tous les coupons
export async function GET(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
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
    safeLogError("Error fetching coupons", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau coupon
export async function POST(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readBoundedJson(request, couponInputSchema);

    let couponData;
    try {
      couponData = normalizeCouponData(body);
    } catch (error) {
      if (error instanceof CouponRuleError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    // Vérifier si le code existe déjà
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", couponData.code)
      .single();

    if (existingCoupon) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert(couponData)
      .select()
      .single();

    if (error) throw error;

    await recordAudit(supabase, {
      action: "coupon.created",
      entityType: "coupon",
      entityId: data.id,
      summary: `Coupon créé : ${data.code}`,
      metadata: { discount_type: data.discount_type, discount_value: data.discount_value },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error creating coupon", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
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
