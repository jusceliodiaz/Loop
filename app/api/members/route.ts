import { VOICE_ROOMS } from "@/config/rooms";
import { getRoomServiceClient } from "@/lib/livekit/roomService";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { data: profiles } = await supabase.from("profiles").select("id, username, display_name");

  const onlineIds = new Set<string>();
  await Promise.all(
    VOICE_ROOMS.map(async (room) => {
      try {
        const participants = await getRoomServiceClient().listParticipants(room.id);
        for (const p of participants) onlineIds.add(p.identity);
      } catch {
        // room has no active session yet — nobody online there
      }
    }),
  );

  const members = (profiles ?? [])
    .map((p) => ({
      id: p.id,
      name: p.display_name ?? p.username,
      online: onlineIds.has(p.id),
    }))
    .sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name));

  return Response.json({ members });
}
