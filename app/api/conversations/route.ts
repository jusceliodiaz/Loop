import { getTextRooms } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const textRooms = await getTextRooms();
  const conversations = await Promise.all(
    textRooms.map(async (room) => {
      const { data } = await supabase
        .from("messages")
        .select("content, created_at, profiles(display_name, username)")
        .eq("room_id", room.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const author = Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles;

      return {
        roomId: room.id,
        roomName: room.name,
        lastMessage: data
          ? {
              content: data.content,
              authorName: author?.display_name ?? author?.username ?? "Usuário",
              createdAt: data.created_at,
            }
          : null,
      };
    }),
  );

  return Response.json({ conversations });
}
