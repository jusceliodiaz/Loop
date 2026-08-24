import { AccessToken } from "livekit-server-sdk";
import { VOICE_ROOMS } from "@/config/rooms";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { room } = await req.json();
  if (typeof room !== "string" || !VOICE_ROOMS.some((r) => r.id === room)) {
    return new Response("unknown room", { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", user.id)
    .single();

  const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: user.id,
    name: profile?.display_name ?? profile?.username ?? user.email ?? user.id,
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: false,
  });

  // best-effort: powers the weekly recap on the home page, never blocks the join
  void supabase.from("room_events").insert({ room_id: room, user_id: user.id });

  return Response.json({ token: await at.toJwt(), url: process.env.NEXT_PUBLIC_LIVEKIT_URL });
}
