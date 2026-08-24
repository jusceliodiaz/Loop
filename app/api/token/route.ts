import { AccessToken } from "livekit-server-sdk";
import { TrackSource } from "@livekit/protocol";
import { getRooms } from "@/lib/rooms";
import { getPlanState } from "@/lib/getPlan";
import { getMonthlyShareSeconds } from "@/lib/roomSessions";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { room: roomId } = await req.json();
  if (typeof roomId !== "string") return new Response("bad request", { status: 400 });

  // Validate against the actual `rooms` table, not a fixed list — any room
  // created from the UI must be joinable the same way a seeded one is.
  const rooms = await getRooms();
  const room = rooms.find((r) => r.id === roomId && r.type === "voice");
  if (!room) return new Response("unknown room", { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", user.id)
    .single();

  const { plan, currentPeriodEnd } = await getPlanState(supabase, user.id);
  if (!plan.voice) {
    return Response.json({ error: "plan_required", need: "basic" }, { status: 402 });
  }

  const usedShareSeconds = await getMonthlyShareSeconds(supabase, user.id, currentPeriodEnd);
  const canShare = plan.screenShare && usedShareSeconds < plan.monthlyShareHours * 3600;

  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: user.id,
    name: profile?.display_name ?? profile?.username ?? user.email ?? user.id,
    ttl: `${plan.maxCallMinutes}m`,
  });

  at.addGrant({
    room: roomId,
    roomJoin: true,
    canPublishSources: canShare
      ? [TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO]
      : [TrackSource.MICROPHONE],
    canSubscribe: true,
    canPublishData: false,
  });

  // best-effort: powers the weekly recap on the home page, never blocks the join
  void supabase.from("room_events").insert({ room_id: roomId, user_id: user.id });

  return Response.json({
    token: await at.toJwt(),
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    canShare,
    maxCallMinutes: plan.maxCallMinutes,
  });
}
