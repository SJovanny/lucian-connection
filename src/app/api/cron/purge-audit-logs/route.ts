import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RETENTION_DAYS = 180;

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("purge_audit_logs", {
      p_retention_days: RETENTION_DAYS,
    });
    if (error) throw error;

    return NextResponse.json({ deleted: data ?? 0 });
  } catch (error) {
    console.error("Audit log purge failed", error);
    return NextResponse.json({ error: "Purge failed" }, { status: 500 });
  }
}

export const GET = POST;
