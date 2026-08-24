import { getVoiceRooms } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";

// Pure Postgres — no LiveKit RoomServiceClient calls here anymore. Presence
// and screen-share state are kept live in voice_presence/room_sessions by
// the LiveKit webhook (app/api/livekit/webhook), so this route (polled by
// the Home page every 15s) no longer costs a round trip to LiveKit's API
// per voice room on every poll.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const voiceRooms = await getVoiceRooms();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: sessions }, { data: profiles }, { data: presence }, { data: sharing }] = await Promise.all([
    supabase.from("room_sessions").select("room_id, user_id, started_at, ended_at").gte("started_at", sevenDaysAgo),
    supabase.from("profiles").select("id, username, display_name"),
    supabase.from("voice_presence").select("room_id, user_id"),
    supabase.from("room_sessions").select("room_id, user_id").is("ended_at", null).not("share_started_at", "is", null),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? p.username]));
  const sharingSet = new Set((sharing ?? []).map((s) => `${s.room_id}:${s.user_id}`));

  const live = voiceRooms.map((room) => ({
    roomId: room.id,
    roomName: room.name,
    participants: (presence ?? [])
      .filter((p) => p.room_id === room.id)
      .map((p) => ({
        identity: p.user_id,
        name: nameById.get(p.user_id) ?? p.user_id,
        sharing: sharingSet.has(`${room.id}:${p.user_id}`),
      })),
  }));

  const recapByRoom = new Map<
    string,
    { joins: number; uniqueUsers: Set<string>; lastActive: string | null; seconds: number }
  >();
  for (const room of voiceRooms) recapByRoom.set(room.id, { joins: 0, uniqueUsers: new Set(), lastActive: null, seconds: 0 });
  for (const session of sessions ?? []) {
    const bucket = recapByRoom.get(session.room_id);
    if (!bucket) continue;
    bucket.joins += 1;
    bucket.uniqueUsers.add(session.user_id);
    const end = session.ended_at ?? new Date().toISOString();
    if (!bucket.lastActive || end > bucket.lastActive) bucket.lastActive = end;
    bucket.seconds += Math.max(0, (new Date(end).getTime() - new Date(session.started_at).getTime()) / 1000);
  }

  const recap = voiceRooms.map((room) => {
    const bucket = recapByRoom.get(room.id)!;
    return {
      roomId: room.id,
      roomName: room.name,
      hours: Math.round((bucket.seconds / 3600) * 10) / 10,
      uniqueUsers: [...bucket.uniqueUsers].map((id) => nameById.get(id) ?? id),
      lastActive: bucket.lastActive,
    };
  });

  return Response.json({ live, recap });
}
