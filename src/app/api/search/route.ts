import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  
  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const supabase = await createClient();
  const searchTerm = `%${query}%`;

  const { data, error } = await supabase
    .from("products_with_discount")
    .select(`
      id,
      slug,
      price,
      discounted_price,
      image_url,
      translations,
      categories (
        slug,
        translations
      )
    `)
    .eq("is_active", true)
    .or(`translations->fr->>name.ilike.${searchTerm},translations->en->>name.ilike.${searchTerm}`)
    .limit(6);

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ products: [] });
  }

  return NextResponse.json({ products: data || [] });
}
