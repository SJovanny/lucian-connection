import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { diffFields, recordAudit } from "@/lib/audit";
import type { Category } from "@/types/database.types";
import { categoryUpdateSchema, uuidSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

// GET - Récupérer une catégorie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    safeLogError("Error fetching category", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readBoundedJson(request, categoryUpdateSchema, 8 * 1024 * 1024);

    const { data: existingCategory } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("categories")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const changes = diffFields(existingCategory as Category, data as Category, [
      "slug",
      "image_url",
      "display_order",
      "translations",
    ]);
    await recordAudit(supabase, {
      action: "category.updated",
      entityType: "category",
      entityId: id,
      summary: `Catégorie modifiée : ${data.translations.fr.name}`,
      changes,
    });

    return NextResponse.json(data);
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error updating category", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id, slug, translations")
      .single();

    if (error) throw error;

    await recordAudit(supabase, {
      action: "category.deleted",
      entityType: "category",
      entityId: id,
      summary: `Catégorie supprimée : ${data?.translations?.fr?.name ?? data?.slug ?? id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    safeLogError("Error deleting category", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
