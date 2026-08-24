"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hash } from "lucide-react";

type Conversation = {
  roomId: string;
  roomName: string;
  lastMessage: { content: string; authorName: string; createdAt: string } | null;
};

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function ConversationCards() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setConversations(data.conversations ?? []);
      } catch {
        // ignore transient network errors, next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (conversations.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="px-1 text-[13px] font-medium text-text-2">Conversas</h2>
      <div className="grid grid-cols-1 gap-3 [@media(min-width:700px)]:grid-cols-3">
        {conversations.map((c) => (
          <Link
            key={c.roomId}
            href={`/room/${c.roomId}`}
            className="flex flex-col gap-2 rounded-[16px] border border-stroke bg-glass-dark p-4 backdrop-blur-2xl transition-colors hover:border-white/15"
          >
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-text-1">
              <Hash size={13} strokeWidth={1.5} className="text-text-3" />
              {c.roomName}
            </span>
            {c.lastMessage ? (
              <>
                <p className="line-clamp-2 text-[12.5px] text-text-2">
                  <span className="text-text-1">{c.lastMessage.authorName}:</span> {c.lastMessage.content}
                </p>
                <span className="text-[11px] text-text-3">{relativeTime(c.lastMessage.createdAt)}</span>
              </>
            ) : (
              <p className="text-[12.5px] text-text-3">Nenhuma mensagem ainda.</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
