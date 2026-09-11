import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPricingQuote, PricingError } from "@/lib/pricing";
import { pricingRequestSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await readBoundedJson(request, pricingRequestSchema);
    const couponId = typeof body.couponId === "string" ? body.couponId.trim() || null : null;
    const couponCode = typeof body.couponCode === "string"
      ? body.couponCode.trim().toUpperCase() || null
      : null;

    const quote = await getPricingQuote(supabase, body.items, {
      couponId,
      couponCode,
      userId: user?.id || null,
      locale: body.locale,
    });

    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: 400 }
      );
    }

    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Pricing quote error", error);
    return NextResponse.json(
      { error: "QUOTE_UNAVAILABLE", details: "Unable to calculate the order total" },
      { status: 500 }
    );
  }
}
