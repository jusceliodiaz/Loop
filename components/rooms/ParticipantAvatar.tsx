"use client";

import { Track } from "livekit-client";
import type { Participant } from "livekit-client";
import { useIsSpeaking, useTrackMutedIndicator } from "@livekit/components-react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ParticipantAvatar({ participant, size = "lg" }: { participant: Participant; size?: "lg" | "sm" }) {
  const speaking = useIsSpeaking(participant);
  const { isMuted } = useTrackMutedIndicator({
    participant,
    source: Track.Source.Microphone,
    publication: participant.getTrackPublication(Track.Source.Microphone),
  });
  const dims = size === "lg" ? "h-20 w-20 text-2xl" : "h-11 w-11 text-sm";
  const name = participant.name || participant.identity;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full bg-[#1D1D23] font-semibold text-[#F5F5F7] transition-all ${dims} ${
          speaking ? "ring-4 ring-[#7CF29C]" : "ring-2 ring-transparent"
        }`}
      >
        {initials(name)}
      </div>
      <span className="flex items-center gap-1 text-xs text-[#98989F]">
        {isMuted && <span aria-label="mudo">🔇</span>}
        {name}
      </span>
    </div>
  );
}
