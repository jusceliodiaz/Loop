import { WebhookReceiver } from "livekit-server-sdk";
import { TrackSource } from "@livekit/protocol";
import { createAdminClient } from "@/lib/supabase/admin";

// Public route — LiveKit signs requests with the same API key/secret used to
// mint tokens, verified below, not with a Supabase session. Listed in
// PUBLIC_PATHS (lib/supabase/middleware.ts) so the auth-redirect middleware
// doesn't intercept it before it reaches this handler.
//
// This replaces client-side polling of RoomServiceClient for presence
// (voice_presence, read live via Realtime) and is the only place
// room_sessions — the record of who was in a voice room, for how long, and
// how much of that was spent sharing a screen — gets written. That table
// backs the weekly recap (real hours instead of a join count) and the plan
// quota check in /api/token.
export async function POST(req: Request) {
  const body = await req.text();
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return new Response("missing signature", { status: 400 });

  const receiver = new WebhookReceiver(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);
  let event: Awaited<ReturnType<WebhookReceiver["receive"]>>;
  try {
    event = await receiver.receive(body, authHeader);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createAdminClient();
  const roomId = event.room?.name;
  const userId = event.participant?.identity;

  switch (event.event) {
    case "participant_joined": {
      if (!roomId || !userId) break;
      await admin.from("room_sessions").insert({ room_id: roomId, user_id: userId, started_at: new Date().toISOString() });
      await admin
        .from("voice_presence")
        .upsert({ room_id: roomId, user_id: userId, joined_at: new Date().toISOString() }, { onConflict: "room_id,user_id" });
      break;
    }

    case "participant_left": {
      if (!roomId || !userId) break;
      const now = new Date();

      const { data: open } = await admin
        .from("room_sessions")
        .select("id, share_started_at, share_seconds")
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (open) {
        const extra = open.share_started_at
          ? Math.max(0, Math.floor((now.getTime() - new Date(open.share_started_at).getTime()) / 1000))
          : 0;
        await admin
          .from("room_sessions")
          .update({ ended_at: now.toISOString(), share_seconds: open.share_seconds + extra, share_started_at: null })
          .eq("id", open.id);
      }

      await admin.from("voice_presence").delete().eq("room_id", roomId).eq("user_id", userId);
      break;
    }

    case "track_published": {
      if (!roomId || !userId || event.track?.source !== TrackSource.SCREEN_SHARE) break;
      await admin
        .from("room_sessions")
        .update({ share_started_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .is("ended_at", null);
      break;
    }

    case "track_unpublished": {
      if (!roomId || !userId || event.track?.source !== TrackSource.SCREEN_SHARE) break;
      const { data: open } = await admin
        .from("room_sessions")
        .select("id, share_started_at, share_seconds")
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (open?.share_started_at) {
        const extra = Math.max(0, Math.floor((Date.now() - new Date(open.share_started_at).getTime()) / 1000));
        await admin
          .from("room_sessions")
          .update({ share_seconds: open.share_seconds + extra, share_started_at: null })
          .eq("id", open.id);
      }
      break;
    }

    case "room_finished": {
      if (!roomId) break;
      // defensive cleanup: close out anything left open if participant_left
      // events were ever missed, and clear stale presence for the room.
      await admin
        .from("room_sessions")
        .update({ ended_at: new Date().toISOString(), share_started_at: null })
        .eq("room_id", roomId)
        .is("ended_at", null);
      await admin.from("voice_presence").delete().eq("room_id", roomId);
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
