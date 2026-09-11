
import { createClient } from "@/lib/supabase/server";
import { getPricingQuote, PricingError, fromCents } from "@/lib/pricing";
import { NextResponse } from "next/server";
import { couponValidationSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

export async function POST(request: Request) {
  try {
    const { code, items, locale } = await readBoundedJson(request, couponValidationSchema);
    const normalizedCode = code.toUpperCase();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const quote = await getPricingQuote(supabase, items, {
      couponCode: normalizedCode,
      userId: user?.id || null,
      locale,
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
    if (err instanceof PricingError) {
      return NextResponse.json(
        { valid: false, message: err.message, error: err.code },
        { status: 400 }
      );
    }
    const requestError = apiRequestErrorResponse(err);
    if (requestError) return requestError;
    safeLogError("Coupon validation error", err);
    return NextResponse.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
