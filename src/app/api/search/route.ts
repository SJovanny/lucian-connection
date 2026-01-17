import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  
  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const supabase = createAdminClient();
  const searchTerm = `%${query}%`;

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      price,
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
