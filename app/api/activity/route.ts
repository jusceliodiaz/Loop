import { TrackSource } from "@livekit/protocol";
import { VOICE_ROOMS } from "@/config/rooms";
import { getRoomServiceClient } from "@/lib/livekit/roomService";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: events }, { data: profiles }] = await Promise.all([
    supabase.from("room_events").select("room_id, user_id, created_at").gte("created_at", sevenDaysAgo),
    supabase.from("profiles").select("id, username, display_name"),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? p.username]));

  const live = await Promise.all(
    VOICE_ROOMS.map(async (room) => {
      let participants: { identity: string; name: string; sharing: boolean }[] = [];
      try {
        const raw = await getRoomServiceClient().listParticipants(room.id);
        participants = raw.map((p) => ({
          identity: p.identity,
          name: nameById.get(p.identity) ?? p.identity,
          sharing: p.tracks.some((t) => t.source === TrackSource.SCREEN_SHARE),
        }));
      } catch {
        // room has no active LiveKit session right now
      }
      return { roomId: room.id, roomName: room.name, participants };
    }),
  );

  const recapByRoom = new Map<string, { joins: number; uniqueUsers: Set<string>; lastActive: string | null }>();
  for (const room of VOICE_ROOMS) recapByRoom.set(room.id, { joins: 0, uniqueUsers: new Set(), lastActive: null });
  for (const event of events ?? []) {
    const bucket = recapByRoom.get(event.room_id);
    if (!bucket) continue;
    bucket.joins += 1;
    bucket.uniqueUsers.add(event.user_id);
    if (!bucket.lastActive || event.created_at > bucket.lastActive) bucket.lastActive = event.created_at;
  }

  const recap = VOICE_ROOMS.map((room) => {
    const bucket = recapByRoom.get(room.id)!;
    return {
      roomId: room.id,
      roomName: room.name,
      joins: bucket.joins,
      uniqueUsers: [...bucket.uniqueUsers].map((id) => nameById.get(id) ?? id),
      lastActive: bucket.lastActive,
    };
  });

  return Response.json({ live, recap });
}
