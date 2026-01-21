
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("preparation_fee, min_order_amount")
      .single();

    if (error) {
      // If table doesn't exist or empty, return defaults
      return NextResponse.json({ preparation_fee: 0, min_order_amount: 0 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { preparation_fee: 0, min_order_amount: 0 },
      { status: 500 }
    );
  }
}
