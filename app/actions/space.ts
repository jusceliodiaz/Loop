"use server";

import { redirect } from "next/navigation";
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
