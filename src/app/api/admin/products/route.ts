import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

const parseAllergens = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      name_fr,
      name_en,
      description_fr,
      description_en,
      allergens_fr,
      allergens_en,
      category_id,
      price,
      compare_at_price,
      unit,
      stock,
      low_stock_threshold,
      track_stock,
      is_active,
      is_featured,
      image_url,
    } = body;

    // Validation basique
    if (!name_fr || !name_en || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name_fr, name_en, price" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name_fr) || "produit";
    let slug = baseSlug;
    let suffix = 2;

    // Slugs remain unique for the database, without requiring admin input.
    while (true) {
      const { data: existingProduct, error: slugError } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (slugError) throw slugError;
      if (!existingProduct) break;

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const productData = {
      slug,
      translations: {
        fr: { name: name_fr, description: description_fr || "" },
        en: { name: name_en, description: description_en || "" },
      },
      allergens: {
        fr: parseAllergens(allergens_fr),
        en: parseAllergens(allergens_en),
      },
      category_id: category_id || null,
      price: parseFloat(price),
      compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
      unit: unit || "each",
      stock: parseInt(stock) || 0,
      low_stock_threshold: parseInt(low_stock_threshold) || 5,
      track_stock: track_stock !== false,
      is_active: is_active !== false,
      is_featured: is_featured === true,
      image_url: image_url || null,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select("*, categories(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
