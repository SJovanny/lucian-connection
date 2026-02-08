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

// GET - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
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

    // Vérifier si le produit existe
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Si le slug change, vérifier qu'il n'existe pas déjà
    if (slug) {
      const { data: slugCheck } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (slugCheck) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Construire l'objet de mise à jour
    const updateData: Record<string, unknown> = {};
    let currentProductCache: { translations?: { fr?: { name?: string; description?: string }; en?: { name?: string; description?: string } }; allergens?: { fr?: string[]; en?: string[] } } | null = null;

    const getCurrentProduct = async () => {
      if (currentProductCache) return currentProductCache;
      const { data } = await supabase
        .from("products")
        .select("translations, allergens")
        .eq("id", id)
        .single();
      currentProductCache = data || null;
      return currentProductCache;
    };

    if (slug !== undefined) updateData.slug = slug;
    if (category_id !== undefined) updateData.category_id = category_id || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (compare_at_price !== undefined) {
      updateData.compare_at_price = compare_at_price ? parseFloat(compare_at_price) : null;
    }
    if (unit !== undefined) updateData.unit = unit;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (low_stock_threshold !== undefined) {
      updateData.low_stock_threshold = parseInt(low_stock_threshold);
    }
    if (track_stock !== undefined) updateData.track_stock = track_stock;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (image_url !== undefined) updateData.image_url = image_url || null;

    if (allergens_fr !== undefined || allergens_en !== undefined) {
      const currentProduct = await getCurrentProduct();
      const currentAllergens = currentProduct?.allergens || { fr: [], en: [] };
      updateData.allergens = {
        fr: allergens_fr !== undefined ? parseAllergens(allergens_fr) : currentAllergens.fr || [],
        en: allergens_en !== undefined ? parseAllergens(allergens_en) : currentAllergens.en || [],
      };
    }

    // Gérer les traductions
    if (name_fr !== undefined || name_en !== undefined || description_fr !== undefined || description_en !== undefined) {
      const currentProduct = await getCurrentProduct();
      const currentTranslations = currentProduct?.translations || {
        fr: { name: "", description: "" },
        en: { name: "", description: "" },
      };

      updateData.translations = {
        fr: {
          name: name_fr !== undefined ? name_fr : currentTranslations.fr?.name || "",
          description: description_fr !== undefined ? description_fr : currentTranslations.fr?.description || "",
        },
        en: {
          name: name_en !== undefined ? name_en : currentTranslations.en?.name || "",
          description: description_en !== undefined ? description_en : currentTranslations.en?.description || "",
        },
      };
    }

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("*, categories(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
