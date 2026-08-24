"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { WARNING_AT_SECONDS_LEFT } from "@/config/limits";

/**
 * Counts down from the plan's per-call cap and disconnects the room when it
 * hits zero. This mirrors, client-side, the same limit already enforced as
 * the LiveKit token's TTL (/api/token) — the countdown is cosmetic, the real
 * cutoff happens at the SFU regardless of what this component does.
 */
export function useCallTimer(maxCallMinutes: number) {
  const room = useRoomContext();
  const limitSeconds = maxCallMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(limitSeconds);
  const disconnectedRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, limitSeconds - elapsed);
      setSecondsLeft(left);

      if (left === 0 && !disconnectedRef.current) {
        disconnectedRef.current = true;
        try {
          sessionStorage.setItem("loop:call-ended-reason", "timeout");
        } catch {
          // private mode / storage disabled — the disconnect itself still happens
        }
        room.disconnect();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room, limitSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { secondsLeft, label, warning: secondsLeft <= WARNING_AT_SECONDS_LEFT };
}
