"use client";

import { useState } from "react";
import { Track } from "livekit-client";
import type { Participant } from "livekit-client";
import { MicOff, Pin, Volume2, VolumeX } from "lucide-react";
import { useIsSpeaking, useTrackMutedIndicator } from "@livekit/components-react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ParticipantAvatar({
  participant,
  size = "lg",
  isSharing = false,
  onPin,
}: {
  participant: Participant;
  size?: "lg" | "sm";
  isSharing?: boolean;
  onPin?: () => void;
}) {
  const speaking = useIsSpeaking(participant);
  const { isMuted } = useTrackMutedIndicator({
    participant,
    source: Track.Source.Microphone,
    publication: participant.getTrackPublication(Track.Source.Microphone),
  });
  const [locallyMuted, setLocallyMuted] = useState(false);
  const dims = size === "lg" ? "h-[88px] w-[88px] text-xl" : "h-11 w-11 text-sm";
  const name = participant.name || participant.identity;

  function toggleLocalMute() {
    const track = participant.getTrackPublication(Track.Source.Microphone)?.track;
    if (track && "setVolume" in track) {
      const next = !locallyMuted;
      (track as { setVolume: (v: number) => void }).setVolume(next ? 0 : 1);
      setLocallyMuted(next);
    }
  }

  return (
    <div className="group flex flex-col items-center gap-2.5">
      <div className="relative">
        <div
          className={`flex items-center justify-center rounded-full bg-black font-medium text-white ${dims}`}
          style={{
            boxShadow: speaking ? "0 0 0 2px var(--live), 0 0 0 6px rgba(74,222,128,.12)" : "0 0 0 0 transparent",
            transition: `box-shadow ${speaking ? "90ms" : "400ms"} ease-out`,
          }}
        >
          {initials(name)}
        </div>

        {!participant.isLocal && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/55 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={toggleLocalMute}
              title="Silenciar para mim"
              className="flex h-6 w-6 items-center justify-center rounded-full text-text-1 hover:bg-glass-2"
            >
              {locallyMuted ? <VolumeX size={13} strokeWidth={1.5} /> : <Volume2 size={13} strokeWidth={1.5} />}
            </button>
            {isSharing && onPin && (
              <button
                onClick={onPin}
                title="Fixar a tela dele"
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-1 hover:bg-glass-2"
              >
                <Pin size={13} strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
      </div>

      {size === "lg" && (
        <span className="flex max-w-[7rem] items-center gap-1 truncate text-[13px] font-[450] text-text-2">
          {isMuted && <MicOff size={11} strokeWidth={1.5} className="shrink-0 text-alert" />}
          <span className="truncate">{name}</span>
        </span>
      )}
    </div>
  );
}
