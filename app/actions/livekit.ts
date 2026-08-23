"use server";

import { AccessToken, TrackSource } from "livekit-server-sdk";
import { createClient } from "@/lib/supabase/server";

export type LiveKitTokenResult =
  | { success: true; token: string; url: string }
  | { success: false; error: string };

export async function getLiveKitToken(channelId: string): Promise<LiveKitTokenResult> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return { success: false, error: "LiveKit não está configurado no servidor." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado." };

  // RLS only returns this row if the current user is a member of the
  // channel's server, so a null result doubles as the authorization check.
  const { data: channel } = await supabase
    .from("channels")
    .select("id, type")
    .eq("id", channelId)
    .maybeSingle();

  if (!channel || channel.type !== "voice") {
    return { success: false, error: "Live Room não encontrada." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  const token = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: profile?.display_name || profile?.username || "Usuário",
  });
  token.addGrant({
    roomJoin: true,
    room: channelId,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canPublishSources: [TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO],
  });

  return { success: true, token: await token.toJwt(), url };
}
