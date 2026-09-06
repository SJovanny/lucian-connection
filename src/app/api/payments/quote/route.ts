import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPricingQuote, PricingError } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    const quote = await getPricingQuote(supabase, body.items, {
      couponId: body.couponId || null,
      couponCode: body.couponCode || null,
      userId: user?.id || null,
      locale: body.locale || "fr",
    });

    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: 400 }
      );
    }

    console.error("Pricing quote error", error);
    return NextResponse.json(
      { error: "QUOTE_UNAVAILABLE", details: "Unable to calculate the order total" },
      { status: 500 }
    );
  }
}
