"use client";

import type { Participant } from "livekit-client";
import { VideoTrack, type TrackReference } from "@livekit/components-react";
import { ParticipantAvatar } from "./ParticipantAvatar";

export function ScreenShareStage({
  tracks,
  participants,
}: {
  tracks: TrackReference[];
  participants: Participant[];
}) {
  const sharingIdentities = new Set(tracks.map((t) => t.participant.identity));
  const others = participants.filter((p) => !sharingIdentities.has(p.identity));

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className={`grid flex-1 gap-3 ${tracks.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {tracks.map((track) => (
          <div key={track.participant.identity} className="flex flex-col gap-1">
            <div className="flex-1 overflow-hidden rounded-lg bg-black">
              <VideoTrack trackRef={track} className="h-full w-full object-contain" />
            </div>
            <span className="text-xs text-[#98989F]">{track.participant.name || track.participant.identity}</span>
          </div>
        ))}
      </div>

      {others.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
          {others.map((p) => (
            <ParticipantAvatar key={p.identity} participant={p} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
