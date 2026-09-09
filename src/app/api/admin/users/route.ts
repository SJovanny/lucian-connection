import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStrictAdminSupabase } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/audit";

const userSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "employee"]),
});

const userIdSchema = z.string().uuid();

export async function GET(request: NextRequest) {
  const supabase = await getStrictAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminClient();
  const [{ data: profiles, error: profilesError }, { data: authUsers, error: usersError }] =
    await Promise.all([
      adminClient.from("profiles").select("id, full_name, role, created_at").in("role", ["admin", "employee"]).order("created_at", { ascending: false }),
      adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  if (profilesError || usersError) {
    return NextResponse.json({ error: "Impossible de charger les utilisateurs" }, { status: 500 });
  }

  const usersById = new Map(authUsers.users.map((user) => [user.id, user]));
  return NextResponse.json({
    users: (profiles ?? []).map((profile) => ({
      ...profile,
      email: usersById.get(profile.id)?.email ?? "",
    })),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await getStrictAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = userSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Email et rôle invalides" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/set-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", data.user.id)
    .select("id")
    .maybeSingle();

  if (profileError || !profile) {
    console.error("User invitation created but role assignment failed", {
      userId: data.user.id,
      email: data.user.email,
      role: parsed.data.role,
      error: profileError ?? "Profile not found",
    });
    return NextResponse.json(
      {
        user: { id: data.user.id, email: data.user.email },
        warning: "Invitation envoyée, mais le rôle n'a pas pu être attribué.",
      },
      { status: 202 }
    );
  }

  await recordAudit(supabase, {
    action: "user.invited",
    entityType: "user",
    entityId: data.user.id,
    summary: `Utilisateur invité : ${data.user.email} (${parsed.data.role})`,
    metadata: { email: data.user.email, role: parsed.data.role },
  });

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await getStrictAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = userIdSchema.safeParse(request.nextUrl.searchParams.get("id"));
  if (!userId.success) {
    return NextResponse.json({ error: "Identifiant utilisateur invalide" }, { status: 400 });
  }

  const { data: currentUser } = await supabase.auth.getUser();
  if (currentUser.user?.id === userId.data) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: authUser, error: getUserError } = await adminClient.auth.admin.getUserById(userId.data);
  if (getUserError || !authUser.user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId.data);
  if (error) {
    return NextResponse.json({ error: "Impossible de supprimer cet utilisateur" }, { status: 500 });
  }

  await recordAudit(supabase, {
    action: "user.deleted",
    entityType: "user",
    entityId: userId.data,
    summary: `Utilisateur supprimé : ${authUser.user.email ?? userId.data}`,
    metadata: { email: authUser.user.email },
  });

  return NextResponse.json({ success: true });
}
