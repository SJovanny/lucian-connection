import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loyaltyRedemptionSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { reward_id } = await readBoundedJson(request, loyaltyRedemptionSchema);

    const { data, error } = await supabase.rpc("loyalty_redeem_reward", {
      p_user_id: user.id,
      p_reward_id: reward_id,
    });
    if (error) {
      if (error.message.includes("insufficient points")) return NextResponse.json({ error: "INSUFFICIENT_POINTS" }, { status: 400 });
      if (error.message.includes("reward not found")) return NextResponse.json({ error: "REWARD_NOT_FOUND" }, { status: 404 });
      throw error;
    }
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Loyalty redemption error", error);
    return NextResponse.json({ error: "Unable to redeem reward" }, { status: 500 });
  }
}
