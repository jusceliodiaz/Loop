"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { getLiveKitToken } from "@/app/actions/livekit";

type ParticipantInfo = {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  micMuted: boolean;
  sharingScreen: boolean;
};

type Status = "connecting" | "connected" | "disconnected" | "error";

export function LiveRoom({ channelId, channelName }: { channelId: string; channelName: string }) {
  const roomRef = useRef<Room | null>(null);
  const screensRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [micEnabled, setMicEnabled] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);

  const syncParticipants = useCallback((room: Room) => {
    const local = room.localParticipant;
    const list: ParticipantInfo[] = [
      {
        identity: local.identity,
        name: local.name || "Você",
        isLocal: true,
        isSpeaking: local.isSpeaking,
        micMuted: !local.isMicrophoneEnabled,
        sharingScreen: local.isScreenShareEnabled,
      },
    ];
    room.remoteParticipants.forEach((p) => {
      list.push({
        identity: p.identity,
        name: p.name || p.identity,
        isLocal: false,
        isSpeaking: p.isSpeaking,
        micMuted: !p.isMicrophoneEnabled,
        sharingScreen: p.isScreenShareEnabled,
      });
    });
    setParticipants(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const room = new Room();
    roomRef.current = room;

    function handleTrackSubscribed(track: RemoteTrack) {
      if (track.source === Track.Source.ScreenShare) {
        const el = track.attach();
        el.className = "w-full rounded-lg bg-black";
        screensRef.current?.appendChild(el);
      } else if (track.source === Track.Source.Microphone || track.source === Track.Source.ScreenShareAudio) {
        audioRef.current?.appendChild(track.attach());
      }
    }

    function handleTrackUnsubscribed(track: RemoteTrack) {
      track.detach().forEach((el) => el.remove());
    }

    const refresh = () => syncParticipants(room);

    room
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ParticipantConnected, refresh)
      .on(RoomEvent.ParticipantDisconnected, refresh)
      .on(RoomEvent.ActiveSpeakersChanged, refresh)
      .on(RoomEvent.TrackMuted, refresh)
      .on(RoomEvent.TrackUnmuted, refresh)
      .on(RoomEvent.LocalTrackPublished, refresh)
      .on(RoomEvent.LocalTrackUnpublished, refresh)
      .on(RoomEvent.Disconnected, () => {
        if (!cancelled) setStatus("disconnected");
      });

    async function join() {
      setStatus("connecting");
      setError(null);
      const result = await getLiveKitToken(channelId);
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setStatus("error");
        return;
      }
      try {
        await room.connect(result.url, result.token);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (cancelled) return;
        setMicEnabled(true);
        setStatus("connected");
        refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível conectar.");
          setStatus("error");
        }
      }
    }

    join();

    return () => {
      cancelled = true;
      room.disconnect();
      roomRef.current = null;
    };
  }, [channelId, syncParticipants]);

  async function toggleMic() {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
    syncParticipants(room);
  }

  async function toggleScreenShare() {
    const room = roomRef.current;
    if (!room) return;
    const next = !sharingScreen;
    try {
      await room.localParticipant.setScreenShareEnabled(next);
      setSharingScreen(next);
      syncParticipants(room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível compartilhar a tela.");
    }
  }

  const connected = status === "connected";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/5 px-4 py-3">
        <h1 className="text-sm font-semibold text-[#F5F5F7]">🔊 {channelName}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {status === "connecting" && <p className="text-sm text-[#98989F]">Conectando...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div ref={screensRef} className="mb-4 flex flex-col gap-3" />

        <div className="flex flex-wrap gap-3">
          {participants.map((p) => (
            <div
              key={p.identity}
              className={`flex w-28 flex-col items-center gap-2 rounded-lg border px-3 py-3 text-center transition ${
                p.isSpeaking ? "border-[#7CF29C]" : "border-white/10"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1D1D23] text-sm font-medium uppercase text-[#F5F5F7]">
                {p.name.slice(0, 2)}
              </div>
              <span className="w-full truncate text-xs text-[#F5F5F7]">{p.isLocal ? "Você" : p.name}</span>
              <span className="text-xs text-[#98989F]">
                {p.micMuted ? "🔇" : "🎙️"}
                {p.sharingScreen && " 🖥️"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div ref={audioRef} className="hidden" />

      <div className="flex gap-2 border-t border-white/5 px-4 py-3">
        <button
          type="button"
          onClick={toggleMic}
          disabled={!connected}
          className="rounded-lg border border-white/10 bg-[#1D1D23] px-4 py-2 text-sm text-[#F5F5F7] transition hover:bg-[#26262E] disabled:opacity-50"
        >
          {micEnabled ? "Mutar" : "Ativar microfone"}
        </button>
        <button
          type="button"
          onClick={toggleScreenShare}
          disabled={!connected}
          className="rounded-lg border border-white/10 bg-[#1D1D23] px-4 py-2 text-sm text-[#F5F5F7] transition hover:bg-[#26262E] disabled:opacity-50"
        >
          {sharingScreen ? "Parar compartilhamento" : "Compartilhar tela"}
        </button>
      </div>
    </div>
  );
}
