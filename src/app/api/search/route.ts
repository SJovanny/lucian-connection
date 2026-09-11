import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ApiSearchQueryError,
  normalizeSearchQuery,
  toPostgrestIlikePattern,
} from "@/lib/api-schemas";
import { safeLogError } from "@/lib/api-request";

export async function GET(request: NextRequest) {
  try {
    const query = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));
    if (!query) return NextResponse.json({ products: [] });

    const supabase = await createClient();
    const searchTerm = toPostgrestIlikePattern(query);

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

    if (error) throw error;

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    if (error instanceof ApiSearchQueryError) {
      return NextResponse.json({ error: "INVALID_SEARCH_QUERY" }, { status: 400 });
    }
    safeLogError("Search error", error);
    return NextResponse.json({ error: "SEARCH_UNAVAILABLE" }, { status: 503 });
  }
}
