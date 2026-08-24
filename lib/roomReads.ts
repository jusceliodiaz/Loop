"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export async function markRoomRead(roomId: string, userId: string) {
  const supabase = createClient();
  await supabase
    .from("room_reads")
    .upsert({ user_id: userId, room_id: roomId, last_read_at: new Date().toISOString() }, { onConflict: "user_id,room_id" });
}

/**
 * Unread count per room = messages from other people since this user's own
 * `room_reads.last_read_at` for that room (no row yet = unread since ever).
 * Re-fetches (all rooms at once, cheap for a handful of rooms) whenever any
 * new message arrives anywhere, rather than trying to track deltas locally
 * — simpler, and DB stays the single source of truth.
 */
export function useUnreadCounts(roomIds: string[], userId: string) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const idsKey = roomIds.join(",");

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const ids = idsKey.split(",").filter(Boolean);
    if (ids.length === 0) return;

    const { data: reads } = await supabase.from("room_reads").select("room_id, last_read_at").eq("user_id", userId);
    const lastReadByRoom = new Map((reads ?? []).map((r) => [r.room_id, r.last_read_at as string]));

    const results = await Promise.all(
      ids.map(async (roomId) => {
        const since = lastReadByRoom.get(roomId);
        let query = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("room_id", roomId)
          .neq("user_id", userId);
        if (since) query = query.gt("created_at", since);
        const { count } = await query;
        return [roomId, count ?? 0] as const;
      }),
    );
    setCounts(Object.fromEntries(results));
  }, [idsKey, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount, refresh below is the ongoing sync
    refresh();

    const supabase = createClient();
    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return counts;
}
