import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

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
      slug,
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
    if (!slug || !name_fr || !name_en || !price) {
      return NextResponse.json(
        { error: "Missing required fields: slug, name_fr, name_en, price" },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
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
