"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PresenceRow = { room_id: string; user_id: string };

/**
 * Live "who's in which voice room", read straight off Realtime instead of
 * polling LiveKit's RoomServiceClient from the browser. voice_presence is
 * kept in sync by the LiveKit webhook (app/api/livekit/webhook). Requires
 * Realtime to be enabled for the table (Dashboard → Database → Replication).
 */
export function useVoicePresence() {
  const [byRoom, setByRoom] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    function addRow(row: PresenceRow) {
      setByRoom((prev) => {
        const next = { ...prev };
        const set = new Set(next[row.room_id] ?? []);
        set.add(row.user_id);
        next[row.room_id] = set;
        return next;
      });
    }

    function removeRow(row: PresenceRow) {
      setByRoom((prev) => {
        const next = { ...prev };
        const set = new Set(next[row.room_id] ?? []);
        set.delete(row.user_id);
        next[row.room_id] = set;
        return next;
      });
    }

    async function loadInitial() {
      const { data } = await supabase.from("voice_presence").select("room_id, user_id");
      if (cancelled || !data) return;
      const map: Record<string, Set<string>> = {};
      for (const row of data as PresenceRow[]) {
        (map[row.room_id] ??= new Set()).add(row.user_id);
      }
      setByRoom(map);
    }

    loadInitial();

    const channel = supabase
      .channel("voice-presence")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "voice_presence" }, (payload) =>
        addRow(payload.new as PresenceRow),
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "voice_presence" }, (payload) =>
        removeRow(payload.old as PresenceRow),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return byRoom;
}
