import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { diffFields, recordAudit } from "@/lib/audit";
import type { Product } from "@/types/database.types";

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
    const supabase = await getStaffSupabase(request);
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
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
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
      unit,
      stock,
      low_stock_threshold,
      track_stock,
      is_alcoholic,
      is_active,
      is_featured,
      image_url,
    } = body;

    // Vérifier si le produit existe (et garder la version "avant" pour le journal d'activité)
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Construire l'objet de mise à jour
    const updateData: Record<string, unknown> = {};

    if (category_id !== undefined) updateData.category_id = category_id || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (unit !== undefined) updateData.unit = unit;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (low_stock_threshold !== undefined) {
      updateData.low_stock_threshold = parseInt(low_stock_threshold);
    }
    if (track_stock !== undefined) updateData.track_stock = track_stock;
    if (is_alcoholic !== undefined) updateData.is_alcoholic = is_alcoholic === true;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (image_url !== undefined) updateData.image_url = image_url || null;

    if (allergens_fr !== undefined || allergens_en !== undefined) {
      const currentAllergens = existingProduct.allergens || { fr: [], en: [] };
      updateData.allergens = {
        fr: allergens_fr !== undefined ? parseAllergens(allergens_fr) : currentAllergens.fr || [],
        en: allergens_en !== undefined ? parseAllergens(allergens_en) : currentAllergens.en || [],
      };
    }

    // Gérer les traductions
    if (name_fr !== undefined || name_en !== undefined || description_fr !== undefined || description_en !== undefined) {
      const currentTranslations = existingProduct.translations || {
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

    if (category_id !== undefined) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", category_id)
        .maybeSingle();
      if (categoryError) throw categoryError;
      if (category?.slug === "boissons-alcoolisees") updateData.is_alcoholic = true;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("*, categories(*)")
      .single();

    if (error) throw error;

    const changes = diffFields(existingProduct as Product, data as Product, [
      "price",
      "category_id",
      "unit",
      "stock",
      "low_stock_threshold",
      "track_stock",
      "is_alcoholic",
      "is_active",
      "is_featured",
      "image_url",
      "translations",
      "allergens",
    ]);
    await recordAudit(supabase, {
      action: "product.updated",
      entityType: "product",
      entityId: id,
      summary: `Produit modifié : ${data.translations.fr.name}`,
      changes,
    });

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
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id, slug, translations")
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

    await recordAudit(supabase, {
      action: "product.deleted",
      entityType: "product",
      entityId: data.id,
      summary: `Produit supprimé : ${data.translations.fr.name}`,
      metadata: { slug: data.slug },
    });

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
