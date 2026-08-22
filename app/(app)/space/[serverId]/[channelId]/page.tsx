import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatRoom } from "@/components/chat/ChatRoom";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const { channelId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: channel } = await supabase
    .from("channels")
    .select("id, name")
    .eq("id", channelId)
    .maybeSingle();

  if (!channel) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, channel_id, user_id, content, created_at, edited_at, profiles(id, username, display_name, avatar_url)")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <ChatRoom
      key={channel.id}
      channelId={channel.id}
      channelName={channel.name}
      currentUserId={user.id}
      initialMessages={messages ?? []}
    />
  );
}
