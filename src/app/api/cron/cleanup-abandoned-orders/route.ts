import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const rpcClient = supabase as unknown as {
      rpc: (functionName: string, args: { p_max_age: string }) => Promise<{
        data: number | null;
        error: Error | null;
      }>;
    };
    const { data, error } = await rpcClient.rpc("cancel_abandoned_orders", {
      p_max_age: "24 hours",
    });
    if (error) throw error;
    return NextResponse.json({ cancelled: data ?? 0 });
  } catch (error) {
    console.error("Abandoned order cleanup failed", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

export const GET = POST;
