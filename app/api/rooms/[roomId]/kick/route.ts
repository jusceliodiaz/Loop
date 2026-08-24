import { getRoomServiceClient } from "@/lib/livekit/roomService";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return new Response("forbidden", { status: 403 });

  const { identity } = await req.json();
  if (typeof identity !== "string") return new Response("bad request", { status: 400 });

  try {
    await getRoomServiceClient().removeParticipant(roomId, identity);
  } catch {
    return new Response("failed to remove participant", { status: 500 });
  }

  return Response.json({ ok: true });
}
