import { ROOMS } from "@/config/rooms";
import { getRoomServiceClient } from "@/lib/livekit/roomService";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const counts: Record<string, number> = Object.fromEntries(ROOMS.map((r) => [r.id, 0]));

  try {
    const rooms = await getRoomServiceClient().listRooms(ROOMS.map((r) => r.id));
    for (const room of rooms) {
      counts[room.name] = room.numParticipants;
    }
  } catch {
    // LiveKit unreachable or no rooms active yet — counts stay at 0
  }

  return Response.json({ counts });
}
