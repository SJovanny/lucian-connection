
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { MIN_ORDER_AMOUNT_CENTS } from "@/lib/pricing-types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("preparation_fee, min_order_amount")
      .single();

    if (error) {
      // If table doesn't exist or empty, return defaults
      return NextResponse.json({ preparation_fee: 0, min_order_amount: MIN_ORDER_AMOUNT_CENTS / 100 });
    }

    return NextResponse.json({
      preparation_fee: data.preparation_fee,
      min_order_amount: Math.max(
        Number(data.min_order_amount) || 0,
        MIN_ORDER_AMOUNT_CENTS / 100
      ),
    });
  } catch {
    return NextResponse.json(
      { preparation_fee: 0, min_order_amount: MIN_ORDER_AMOUNT_CENTS / 100 },
      { status: 500 }
    );
  }
}
