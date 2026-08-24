import { createClient } from "@/lib/supabase/server";

export type RoomType = "voice" | "text";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
};

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("id, name, type").order("created_at", { ascending: true });
  return data ?? [];
}

export async function getVoiceRooms(): Promise<Room[]> {
  return (await getRooms()).filter((r) => r.type === "voice");
}

export async function getTextRooms(): Promise<Room[]> {
  return (await getRooms()).filter((r) => r.type === "text");
}
