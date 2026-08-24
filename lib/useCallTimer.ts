"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { MAX_CALL_MINUTES, WARNING_AT_SECONDS_LEFT } from "@/config/limits";

const LIMIT_SECONDS = MAX_CALL_MINUTES * 60;

/** Counts down from the per-call cap and disconnects the room when it hits zero. */
export function useCallTimer() {
  const room = useRoomContext();
  const [secondsLeft, setSecondsLeft] = useState(LIMIT_SECONDS);
  const disconnectedRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, LIMIT_SECONDS - elapsed);
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
  }, [room]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { secondsLeft, label, warning: secondsLeft <= WARNING_AT_SECONDS_LEFT };
}
