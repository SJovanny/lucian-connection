import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { reward_id } = await request.json();
    if (typeof reward_id !== "string") return NextResponse.json({ error: "Invalid reward" }, { status: 400 });

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
    console.error("Loyalty redemption error", error);
    return NextResponse.json({ error: "Unable to redeem reward" }, { status: 500 });
  }
}
