
import { createClient } from "@/lib/supabase/server";
import { getPricingQuote, PricingError, fromCents } from "@/lib/pricing";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, items, locale } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const quote = await getPricingQuote(supabase, items, {
      couponCode: String(code || "").trim().toUpperCase(),
      userId: user?.id || null,
      locale: locale || "fr",
    });

    return NextResponse.json({
      valid: true,
      coupon: {
        id: quote.coupon?.id,
        code: quote.coupon?.code,
      },
      discountAmount: fromCents(quote.discount_cents),
      quote,
    });

  } catch (err) {
    console.error("Coupon validation error:", err);
    if (err instanceof PricingError) {
      return NextResponse.json(
        { valid: false, message: err.message, error: err.code },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
