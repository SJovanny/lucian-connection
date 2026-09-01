import { NextResponse } from "next/server";

// Orders must be created through the server-side Stripe flow.
export async function POST() {
  return NextResponse.json(
    { error: "Use the Stripe checkout session endpoint" },
    { status: 410 }
  );
}
