"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectionState, Track } from "livekit-client";
import {
  DisconnectButton,
  RoomAudioRenderer,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { ShareProfileDialog, type ShareProfile } from "./ShareProfileDialog";
import { ScreenShareStage } from "./ScreenShareStage";
import { PushToTalkSettings } from "./PushToTalkSettings";
import { keyLabel, loadPushToTalkSettings, savePushToTalkSettings, type PushToTalkConfig } from "@/lib/pushToTalk";

export function StageInner({ roomName }: { roomName: string }) {
  const participants = useParticipants();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const connectionState = useConnectionState();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPttSettings, setShowPttSettings] = useState(false);
  const [ptt, setPtt] = useState<PushToTalkConfig>(() => loadPushToTalkSettings());
  const pttKeyDown = useRef(false);

  const isSharing = screenShareTracks.some((t) => t.participant.identity === localParticipant.identity);
  const reconnecting = connectionState === ConnectionState.Reconnecting;

  // entering push-to-talk mode mutes the already-published mic track;
  // it stays live only while the configured key (or the mic button) is held
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
  }

  async function stopShare() {
    await localParticipant.setScreenShareEnabled(false);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {reconnecting && (
        <div className="bg-[#3A2E1D] px-4 py-1.5 text-center text-xs text-[#F2C572]">Reconectando…</div>
      )}

      <header className="flex items-center justify-between border-b border-white/5 px-6 py-3">
        <h1 className="text-sm font-medium text-[#F5F5F7]">{roomName}</h1>
        <span className="text-xs text-[#98989F]">
          {participants.length} {participants.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto p-6">
        {screenShareTracks.length > 0 ? (
          <ScreenShareStage tracks={screenShareTracks} participants={participants} />
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {participants.map((p) => (
              <ParticipantAvatar key={p.identity} participant={p} />
            ))}
          </div>
        )}
      </div>

      <footer className="flex items-center justify-center gap-3 border-t border-white/5 px-6 py-4">
        <button
          onClick={() => !ptt.enabled && localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
          onMouseDown={() => ptt.enabled && localParticipant.setMicrophoneEnabled(true)}
          onMouseUp={() => ptt.enabled && localParticipant.setMicrophoneEnabled(false)}
          onMouseLeave={() => ptt.enabled && isMicrophoneEnabled && localParticipant.setMicrophoneEnabled(false)}
          title={ptt.enabled ? `Segure para falar (${keyLabel(ptt.key)})` : "Microfone"}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            isMicrophoneEnabled
              ? "bg-[#1D1D23] text-[#F5F5F7] hover:bg-[#26262E]"
              : "bg-[#3A1D22] text-[#FF6B7A]"
          }`}
        >
          🎙️
        </button>

        <button
          onClick={() => (isSharing ? stopShare() : setShowShareDialog(true))}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            isSharing ? "bg-[#7CF29C] text-[#0D0D10]" : "bg-[#1D1D23] text-[#F5F5F7] hover:bg-[#26262E]"
          }`}
          title="Compartilhar tela"
        >
          🖥️
        </button>

        <button
          onClick={() => setShowPttSettings(true)}
          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm transition ${
            ptt.enabled ? "bg-[#7CF29C] text-[#0D0D10]" : "bg-[#1D1D23] text-[#F5F5F7] hover:bg-[#26262E]"
          }`}
          title="Configurar push-to-talk"
        >
          ⚙️
        </button>

        <DisconnectButton
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D1D23] text-[#F5F5F7] transition hover:bg-[#3A1D22] hover:text-[#FF6B7A]"
          title="Sair"
        >
          ⏻
        </DisconnectButton>
      </footer>

      <RoomAudioRenderer />
      {showShareDialog && <ShareProfileDialog onSelect={startShare} onClose={() => setShowShareDialog(false)} />}
      {showPttSettings && (
        <PushToTalkSettings config={ptt} onChange={updatePtt} onClose={() => setShowPttSettings(false)} />
      )}
    </div>
  );
}
