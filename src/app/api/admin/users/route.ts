import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStrictAdminSupabase } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const userSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "employee"]),
});

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

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", data.user.id);

  if (profileError) {
    return NextResponse.json(
      { error: "Invitation créée, mais le rôle n'a pas pu être attribué." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } }, { status: 201 });
}
