"use client";

import { useEffect, useRef } from "react";
import type { Room } from "@/lib/rooms";
import { useUnreadCounts } from "@/lib/roomReads";
import { useAppUser } from "@/lib/appUser";

/**
 * A live message nobody sees is wasted — this is the minimum viable
 * "you missed something": while the tab is hidden, prefix the title with
 * the unread count across text rooms, and restore it once the tab regains
 * focus (which is also when MarkRoomRead fires for whatever room is open).
 * Renders nothing.
 */
export function UnreadTitleWatcher({ rooms }: { rooms: Room[] }) {
  const self = useAppUser();
  const textRoomIds = rooms.filter((r) => r.type === "text").map((r) => r.id);
  const unread = useUnreadCounts(textRoomIds, self.id);
  const originalTitle = useRef<string | null>(null);

  useEffect(() => {
    if (originalTitle.current === null) originalTitle.current = document.title;
  }, []);

  useEffect(() => {
    if (!document.hidden) return;
    const total = Object.values(unread).reduce((sum, n) => sum + n, 0);
    document.title = total > 0 ? `(${total}) ${originalTitle.current}` : (originalTitle.current ?? document.title);
  }, [unread]);

  useEffect(() => {
    function onVisible() {
      if (!document.hidden && originalTitle.current !== null) document.title = originalTitle.current;
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return null;
}
