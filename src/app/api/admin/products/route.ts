import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { recordAudit } from "@/lib/audit";
import { productCreateSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

// GET - Récupérer tous les produits
export async function GET(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
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
    safeLogError("Error fetching products", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name_fr,
      name_en,
      description_fr,
      description_en,
      allergens_fr,
      allergens_en,
      category_id,
      price,
      unit,
      stock,
      low_stock_threshold,
      track_stock,
      is_alcoholic,
      is_active,
      is_featured,
      image_url,
    } = await readBoundedJson(request, productCreateSchema, 8 * 1024 * 1024);

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

    let categoryIsAlcoholic = false;
    if (category_id) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", category_id)
        .maybeSingle();
      if (categoryError) throw categoryError;
      categoryIsAlcoholic = category?.slug === "boissons-alcoolisees";
    }

    const productData = {
      slug,
      translations: {
        fr: { name: name_fr, description: description_fr || "" },
        en: { name: name_en, description: description_en || "" },
      },
      allergens: {
        fr: allergens_fr,
        en: allergens_en,
      },
      category_id,
      price,
      unit,
      stock,
      low_stock_threshold,
      track_stock,
      is_alcoholic: is_alcoholic === true || categoryIsAlcoholic,
      is_active,
      is_featured,
      image_url,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select("*, categories(*)")
      .single();

    if (error) throw error;

    await recordAudit(supabase, {
      action: "product.created",
      entityType: "product",
      entityId: data.id,
      summary: `Produit créé : ${data.translations.fr.name}`,
      metadata: { slug: data.slug, price: data.price },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error creating product", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
