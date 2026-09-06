
import { createClient } from "@/lib/supabase/server";
import { getPricingQuote, PricingError, fromCents } from "@/lib/pricing";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code, items, locale } = await request.json();
    const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";
    if (!normalizedCode) {
      return NextResponse.json(
        {
          valid: false,
          error: "COUPON_CODE_REQUIRED",
          message: locale === "en" ? "Please enter a promo code." : "Veuillez saisir un code promo.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const quote = await getPricingQuote(supabase, items, {
      couponCode: normalizedCode,
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
