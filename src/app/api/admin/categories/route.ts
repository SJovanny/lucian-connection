import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { categoryCreateSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

// GET - Récupérer toutes les catégories
export async function GET(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    safeLogError("Error fetching categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await readBoundedJson(request, categoryCreateSchema, 8 * 1024 * 1024);

    const { data, error } = await supabase
      .from("categories")
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    await recordAudit(supabase, {
      action: "category.created",
      entityType: "category",
      entityId: data.id,
      summary: `Catégorie créée : ${data.translations.fr.name}`,
      metadata: { slug: data.slug },
    });

    return NextResponse.json(data);
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Error creating category", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
