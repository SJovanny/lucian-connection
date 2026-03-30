/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  console.log("=== ORDER API CALLED ===");

  try {
    const supabase = await createClient();
    const body = await request.json();
    console.log("[orders] Request body:", JSON.stringify(body, null, 2));

    const {
      items,
      subtotal,
      delivery_fee,
      total_amount,
      phone,
      notes,
      coupon_id,
      discount_amount,
      locale,
      full_name,
    } = body;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[orders] Auth user:", user?.id, "Auth error:", authError);

    if (!user) {
      console.log("[orders] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log("[orders] Empty cart submitted");
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    // Check if profile exists
    const { data: profile, error: profileCheckError } = await (supabase as any)
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    console.log("[orders] Profile check:", profile, "Error:", profileCheckError);

    // Create profile if it doesn't exist
    if (!profile) {
      console.log("[orders] Creating profile for user:", user.id);
      const { error: createProfileError } = await (supabase as any)
        .from("profiles")
        .insert({
          id: user.id,
          full_name: full_name || user.user_metadata?.full_name || null,
          email: user.email,
          phone: phone || null,
        });

      if (createProfileError) {
        console.log("[orders] Profile creation error:", createProfileError);
      }
    }

    const orderData = {
      user_id: user.id,
      status: "pending",
      subtotal: Number(subtotal),
      delivery_fee: Number(delivery_fee) || 0,
      total_amount: Number(total_amount),
      phone: phone || null,
      notes: notes || null,
      locale: locale || "fr",
      coupon_id: coupon_id || null,
      discount_amount: Number(discount_amount) || 0,
      delivery_address: null,
    };

    console.log("[orders] Inserting order:", JSON.stringify(orderData, null, 2));

    const { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    console.log("[orders] Order result:", order, "Order error:", orderError);

    if (orderError) {
      throw orderError;
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      total_price: Number(item.price) * item.quantity,
    }));

    console.log("[orders] Inserting order items:", JSON.stringify(orderItems, null, 2));

    const { error: itemsError } = await (supabase as any)
      .from("order_items")
      .insert(orderItems);

    console.log("[orders] Items insert error:", itemsError);

    if (itemsError) {
      throw itemsError;
    }

    if (full_name || phone) {
      console.log("[orders] Updating profile contact");
      await (supabase as any)
        .from("profiles")
        .update({
          full_name: full_name || null,
          phone: phone || null,
        })
        .eq("id", user.id);
    }

    console.log("=== ORDER CREATED SUCCESSFULLY ===");
    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("=== ORDER ERROR ===");
    console.error("Error creating order:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error?.message || error?.code || String(error)
      },
      { status: 500 }
    );
  }
}
