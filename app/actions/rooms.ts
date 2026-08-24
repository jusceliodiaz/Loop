"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateRoomState = { error: string | null };

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createRoom(_prev: CreateRoomState, formData: FormData): Promise<CreateRoomState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = formData.get("type") === "text" ? "text" : "voice";

  if (name.length < 2 || name.length > 32) {
    return { error: "Nome deve ter entre 2 e 32 caracteres" };
  }

  const baseId = slugify(name);
  if (!baseId) return { error: "Nome inválido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "não autenticado" };

  let id = baseId;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("rooms").insert({ id, name, type, created_by: user.id });
    if (!error) {
      revalidatePath("/", "layout");
      redirect(`/room/${id}`);
    }
    if (error.code !== "23505") return { error: "não foi possível criar a sala" };
    id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return { error: "não foi possível criar a sala" };
}
