
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export async function POST(request: Request) {
  try {
    const { code, orderTotal } = await request.json();
    const supabase = await createClient();

    // 1. Fetch coupon
    const { data: coupon, error } = await supabase
      .from("coupons_active")
      .select("*")
      .eq("code", code)
      .single<Coupon>();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, message: "Coupon invalid" },
        { status: 400 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (coupon.user_id && coupon.user_id !== user?.id) {
      return NextResponse.json({ valid: false, message: "Coupon invalid" }, { status: 400 });
    }

    // 2. Validate basic status
    // Time window is enforced by coupons_active view (DB clock)

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        { valid: false, message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // 3. Validate order conditions
    if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
      return NextResponse.json(
        { 
          valid: false, 
          message: `Minimum order of ${coupon.min_order_amount} required` 
        },
        { status: 400 }
      );
    }

    // 4. Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure we don't discount more than the total
    discountAmount = Math.min(discountAmount, orderTotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discountAmount
    });

  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
