import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const supabase = await createClient();

  const { data: channel } = await supabase
    .from("channels")
    .select("id")
    .eq("server_id", serverId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!channel) notFound();

  redirect(`/space/${serverId}/${channel.id}`);
}
