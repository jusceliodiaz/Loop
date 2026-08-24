"use client";

import { useEffect } from "react";
import { markRoomRead } from "@/lib/roomReads";

/** Renders nothing — just marks `roomId` read for `userId` on mount and whenever the tab regains focus. */
export function MarkRoomRead({ roomId, userId }: { roomId: string; userId: string }) {
  useEffect(() => {
    markRoomRead(roomId, userId);

    function onFocus() {
      markRoomRead(roomId, userId);
    }

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [roomId, userId]);

  return null;
}
