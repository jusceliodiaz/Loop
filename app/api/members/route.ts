import { createClient } from "@/lib/supabase/server";

// Online = has a row in voice_presence (kept live by the LiveKit webhook) —
// no more per-request calls to LiveKit's RoomServiceClient across every
// voice room.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const [{ data: profiles }, { data: presence }] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, role, approved, plan"),
    supabase.from("voice_presence").select("user_id"),
  ]);

  const onlineIds = new Set((presence ?? []).map((p) => p.user_id));

  const members = (profiles ?? [])
    .map((p) => ({
      id: p.id,
      name: p.display_name ?? p.username,
      online: onlineIds.has(p.id),
      role: p.role as "admin" | "member",
      approved: p.approved,
      plan: p.plan as "free" | "basic" | "pro",
    }))
    .sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name));

  return Response.json({ members });
}
