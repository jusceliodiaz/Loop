"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateSpaceState = { error: string | null };

export async function createSpace(
  _prev: CreateSpaceState,
  formData: FormData,
): Promise<CreateSpaceState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 100) {
    return { error: "O nome do Space deve ter entre 2 e 100 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: server, error } = await supabase
    .from("servers")
    .insert({ name, owner_id: user.id })
    .select("id")
    .single();

  if (error || !server) {
    return { error: error?.message ?? "Não foi possível criar o Space." };
  }

  redirect(`/space/${server.id}`);
}

export type AddMemberState = { error: string | null; success: string | null };

export async function addMember(
  _prev: AddMemberState,
  formData: FormData,
): Promise<AddMemberState> {
  const serverId = String(formData.get("serverId") ?? "");
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();

  if (!username) return { error: "Informe um username.", success: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return { error: "Nenhum usuário com esse username.", success: null };

  const { error } = await supabase
    .from("server_members")
    .insert({ server_id: serverId, user_id: profile.id, role: "member" });

  if (error) {
    if (error.code === "23505") {
      return { error: "Esse usuário já faz parte do Space.", success: null };
    }
    return { error: error.message, success: null };
  }

  revalidatePath(`/space/${serverId}`);
  return { error: null, success: `${username} foi adicionado ao Space.` };
}

export type CreateRoomState = { error: string | null };

export async function createRoom(
  _prev: CreateRoomState,
  formData: FormData,
): Promise<CreateRoomState> {
  const serverId = String(formData.get("serverId") ?? "");
  const name = String(formData.get("name") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const type = String(formData.get("type") ?? "text");

  if (name.length < 2 || name.length > 50) {
    return { error: "O nome da Room deve ter entre 2 e 50 caracteres." };
  }
  if (type !== "text" && type !== "voice") {
    return { error: "Tipo de Room inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("channels").insert({ server_id: serverId, name, type });

  if (error) return { error: error.message };

  revalidatePath(`/space/${serverId}`);
  return { error: null };
}
