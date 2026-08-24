"use client";

import type { Participant } from "livekit-client";
import { VideoTrack, type TrackReference } from "@livekit/components-react";
import { ParticipantAvatar } from "./ParticipantAvatar";

export function ScreenShareStage({
  tracks,
  participants,
  activeIdentity,
  onSelect,
}: {
  tracks: TrackReference[];
  participants: Participant[];
  activeIdentity: string | null;
  onSelect: (identity: string) => void;
}) {
  const sharingIdentities = new Set(tracks.map((t) => t.participant.identity));
  const active = tracks.find((t) => t.participant.identity === activeIdentity) ?? tracks[0];
  const others = tracks.filter((t) => t !== active);

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 [@media(min-width:900px)]:flex-row [@media(min-width:900px)]:gap-8">
      <div className="relative flex flex-1 items-center justify-center">
        {others.map((track, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const offset = 120 + Math.floor(i / 2) * 40;
          return (
            <button
              key={track.participant.identity}
              onClick={() => onSelect(track.participant.identity)}
              title={`Trazer a tela de ${track.participant.name || track.participant.identity} para frente`}
              className="stage-surface absolute hidden overflow-hidden rounded-[14px] bg-black opacity-70 [@media(min-width:900px)]:block"
              style={{
                width: "62%",
                aspectRatio: "16 / 9",
                transform: `translateX(${side * offset}px) scale(0.88)`,
              }}
            >
              <VideoTrack trackRef={track} className="h-full w-full object-cover" />
            </button>
          );
        })}

        {active && (
          <div
            className="stage-surface relative z-10 w-full overflow-hidden rounded-[14px] border border-stroke bg-black [@media(min-width:900px)]:w-[62%]"
            style={{ aspectRatio: "16 / 9", boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
          >
            <VideoTrack trackRef={active} className="h-full w-full object-contain" />
            <span className="absolute bottom-3 left-3 rounded-full border border-stroke bg-glass-dark px-3 py-1 text-[12px] font-[450] text-text-1 backdrop-blur-2xl">
              Tela de {active.participant.name || active.participant.identity}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-row items-center gap-2.5 [@media(min-width:900px)]:flex-col">
        {participants.map((p) => (
          <ParticipantAvatar
            key={p.identity}
            participant={p}
            size="sm"
            isSharing={sharingIdentities.has(p.identity)}
            onPin={sharingIdentities.has(p.identity) ? () => onSelect(p.identity) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
