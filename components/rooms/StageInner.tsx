"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectionState, Track } from "livekit-client";
import {
  DisconnectButton,
  RoomAudioRenderer,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useSpeakingParticipants,
  useTracks,
} from "@livekit/components-react";
import { Loader2, LogOut, Mic, MicOff, ScreenShare, ScreenShareOff, Settings } from "lucide-react";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { ShareProfileDialog, type ShareProfile } from "./ShareProfileDialog";
import { ScreenShareStage } from "./ScreenShareStage";
import { PushToTalkSettings } from "./PushToTalkSettings";
import { keyLabel, loadPushToTalkSettings, savePushToTalkSettings, type PushToTalkConfig } from "@/lib/pushToTalk";
import { useAmbientLight } from "@/lib/useAmbientLight";
import { MembersPanel } from "./MembersPanel";

export function StageInner({ roomName }: { roomName: string }) {
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const speakingParticipants = useSpeakingParticipants();
  const connectionState = useConnectionState();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPttSettings, setShowPttSettings] = useState(false);
  const [activeShareIdentity, setActiveShareIdentity] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<ShareProfile | null>(null);
  const [ptt, setPtt] = useState<PushToTalkConfig>(() => loadPushToTalkSettings());
  const pttKeyDown = useRef(false);

  const isSharing = screenShareTracks.some((t) => t.participant.identity === localParticipant.identity);
  const reconnecting = connectionState === ConnectionState.Reconnecting;
  const alone = participants.length <= 1;

  const activeTrack =
    screenShareTracks.find((t) => t.participant.identity === activeShareIdentity) ?? screenShareTracks[0];

  const ambient = useAmbientLight({
    activeShareTrack: activeTrack?.publication?.track,
    speakingIdentity: speakingParticipants[0]?.identity,
  });
  const ambientStyle = useMemo(
    () => ({ "--amb-1": ambient[0], "--amb-2": ambient[1], "--amb-3": ambient[2] }) as React.CSSProperties,
    [ambient],
  );

  useEffect(() => {
    if (ptt.enabled) localParticipant.setMicrophoneEnabled(false);
  }, [ptt.enabled, localParticipant]);

  useEffect(() => {
    if (!ptt.enabled) return;

    function isTypingTarget(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== ptt.key || pttKeyDown.current || isTypingTarget(e.target)) return;
      e.preventDefault();
      pttKeyDown.current = true;
      localParticipant.setMicrophoneEnabled(true);
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code !== ptt.key) return;
      pttKeyDown.current = false;
      localParticipant.setMicrophoneEnabled(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [ptt.enabled, ptt.key, localParticipant]);

  function updatePtt(next: PushToTalkConfig) {
    setPtt(next);
    savePushToTalkSettings(next);
  }

  async function startShare(profile: ShareProfile) {
    setShowShareDialog(false);
    await localParticipant.setScreenShareEnabled(true, profile.options);
    setActiveProfile(profile);
    setActiveShareIdentity(localParticipant.identity);
  }

  async function stopShare() {
    await localParticipant.setScreenShareEnabled(false);
    setActiveProfile(null);
  }

  const statusLine = reconnecting
    ? "A conexão caiu. Reconectando…"
    : ptt.enabled
      ? `Segure ${keyLabel(ptt.key).toLowerCase()} para falar`
      : isMicrophoneEnabled
        ? `Microfone aberto · ${roomName}`
        : "Microfone fechado";

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="stage-fade-in relative flex flex-1 flex-col overflow-hidden">
        <div className="ambient-light pointer-events-none absolute inset-0" style={ambientStyle} aria-hidden="true" />

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-32">
        {screenShareTracks.length > 0 ? (
          <ScreenShareStage
            tracks={screenShareTracks}
            participants={participants}
            activeIdentity={activeTrack?.participant.identity ?? null}
            onSelect={setActiveShareIdentity}
          />
        ) : alone ? (
          <p className="text-[14.5px] text-text-2">Você é o primeiro aqui.</p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-10">
            {participants.map((p) => (
              <ParticipantAvatar key={p.identity} participant={p} />
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center px-6">
        <div
          className="pointer-events-auto flex w-full max-w-[720px] flex-col gap-2 rounded-[20px] border border-stroke bg-glass-dark px-5 py-4 backdrop-blur-2xl"
          style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
        >
          <p className="flex items-center gap-2 text-[14.5px] text-text-2">
            {reconnecting && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
            {statusLine}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => !ptt.enabled && localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
              onMouseDown={() => ptt.enabled && localParticipant.setMicrophoneEnabled(true)}
              onMouseUp={() => ptt.enabled && localParticipant.setMicrophoneEnabled(false)}
              onMouseLeave={() => ptt.enabled && isMicrophoneEnabled && localParticipant.setMicrophoneEnabled(false)}
              title="Abrir microfone"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isMicrophoneEnabled
                  ? "bg-glass-1 text-text-2 hover:bg-glass-2 hover:text-text-1"
                  : "border border-alert text-alert"
              }`}
            >
              {isMicrophoneEnabled ? <Mic size={16} strokeWidth={1.5} /> : <MicOff size={16} strokeWidth={1.5} />}
            </button>

            <button
              onClick={() => (isSharing ? stopShare() : setShowShareDialog(true))}
              title={isSharing ? "Parar de compartilhar" : "Compartilhar tela"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                isSharing ? "bg-glass-2 text-text-1" : "bg-glass-1 text-text-2 hover:bg-glass-2 hover:text-text-1"
              }`}
            >
              {isSharing ? <ScreenShareOff size={16} strokeWidth={1.5} /> : <ScreenShare size={16} strokeWidth={1.5} />}
            </button>

            <button
              onClick={() => setShowPttSettings(true)}
              title="Configurar push-to-talk"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                ptt.enabled ? "bg-glass-2 text-text-1" : "bg-glass-1 text-text-2 hover:bg-glass-2 hover:text-text-1"
              }`}
            >
              <Settings size={16} strokeWidth={1.5} />
            </button>

            {activeProfile && (
              <span className="flex h-7 items-center gap-1.5 rounded-full bg-glass-1 py-0 pr-2.5 pl-3 text-[12px] font-[450] text-text-2">
                {activeProfile.hint}
                <button
                  onClick={stopShare}
                  title="Parar de compartilhar"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-text-3 hover:text-text-1"
                >
                  ×
                </button>
              </span>
            )}

            <div className="flex-1" />

            <DisconnectButton
              title="Sair da sala"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-glass-3 text-text-1 transition-colors hover:brightness-110"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </DisconnectButton>
          </div>
        </div>
      </div>

        <RoomAudioRenderer />
        {showShareDialog && <ShareProfileDialog onSelect={startShare} onClose={() => setShowShareDialog(false)} />}
        {showPttSettings && (
          <PushToTalkSettings config={ptt} onChange={updatePtt} onClose={() => setShowPttSettings(false)} />
        )}
      </div>

      <MembersPanel roomParticipants={participants} />
    </div>
  );
}
