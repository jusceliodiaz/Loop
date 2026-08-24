"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Author = {
  id: string;
  username: string;
  display_name: string | null;
};

type ChatMessage = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  profiles: Author | Author[] | null;
};

function authorOf(message: ChatMessage): Author | null {
  return Array.isArray(message.profiles) ? (message.profiles[0] ?? null) : message.profiles;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** The message list + composer, no chrome — used both as a room-stage overlay and as a full-page thread. */
export function ChatThread({
  roomId,
  roomName,
  currentUserId,
  variant = "overlay",
}: {
  roomId: string;
  roomName: string;
  currentUserId: string;
  variant?: "overlay" | "full";
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("messages")
      .select("id, room_id, user_id, content, created_at, edited_at, profiles(id, username, display_name)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!cancelled && data) setMessages(data as unknown as ChatMessage[]);
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, roomId]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const row = payload.new as ChatMessage;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, display_name")
            .eq("id", row.user_id)
            .single();
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, { ...row, profiles: profile }]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? { ...m, content: row.content, edited_at: row.edited_at } : m)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("messages").insert({ room_id: roomId, user_id: currentUserId, content });
    setSending(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDraft("");
  }

  async function handleSaveEdit(id: string) {
    const content = editDraft.trim();
    if (!content) return;
    const { error: updateError } = await supabase
      .from("messages")
      .update({ content, edited_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase.from("messages").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
  }

  const bubbleMaxWidth = variant === "full" ? "max-w-[62%]" : "max-w-[85%]";
  const avatarSize = variant === "full" ? "h-8 w-8 text-[11px]" : "h-6 w-6 text-[10px]";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className={`flex-1 overflow-y-auto ${variant === "full" ? "px-6 py-6" : "px-3 py-4"}`}>
        {messages.length === 0 && <p className="py-8 text-center text-[13px] text-text-3">Nenhuma mensagem ainda.</p>}
        <div className="flex flex-col gap-4">
          {messages.map((message) => {
            const author = authorOf(message);
            const authorName = author?.display_name || author?.username || "Usuário";
            const isOwn = message.user_id === currentUserId;
            const isEditing = editingId === message.id;

            return (
              <div key={message.id} className={`group flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full bg-black font-medium text-white ${avatarSize}`}
                >
                  {initials(authorName)}
                </span>

                <div className={`flex flex-col gap-1 ${bubbleMaxWidth} ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && <span className="px-1 text-[12px] font-medium text-text-2">{authorName}</span>}

                  {isEditing ? (
                    <div className="flex w-full gap-2">
                      <input
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(message.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 rounded-[10px] border border-stroke-soft bg-glass-1 px-2 py-1 text-[13px] text-text-1 outline-none"
                      />
                      <button onClick={() => handleSaveEdit(message.id)} className="text-[11px] text-text-1">
                        salvar
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-[11px] text-text-3">
                        cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {isOwn && (
                        <span className="hidden items-center gap-1 group-hover:flex">
                          <button
                            title="Editar"
                            onClick={() => {
                              setEditingId(message.id);
                              setEditDraft(message.content);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-text-3 hover:bg-glass-1 hover:text-text-1"
                          >
                            <Pencil size={11} strokeWidth={1.5} />
                          </button>
                          <button
                            title="Excluir"
                            onClick={() => handleDelete(message.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-text-3 hover:bg-glass-1 hover:text-alert"
                          >
                            <Trash2 size={11} strokeWidth={1.5} />
                          </button>
                        </span>
                      )}
                      <p
                        className={`rounded-2xl px-3.5 py-2 text-[13.5px] break-words whitespace-pre-wrap backdrop-blur-2xl ${
                          isOwn ? "bg-glass-2 text-text-1" : "bg-glass-dark text-text-1"
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                  )}

                  <span className="px-1 text-[11px] text-text-3">
                    {formatTime(message.created_at)}
                    {message.edited_at && " · editado"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-1 text-[11px] text-alert">{error}</p>}

      <form
        onSubmit={handleSend}
        className={
          variant === "full"
            ? "mx-auto mb-6 flex w-full max-w-[720px] gap-2 rounded-[20px] border border-stroke bg-glass-dark px-4 py-3 backdrop-blur-2xl"
            : "flex gap-2 border-t border-stroke-soft p-3"
        }
        style={variant === "full" ? { boxShadow: "0 18px 50px rgba(0,0,0,.45)" } : undefined}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Mensagem em ${roomName}`}
          maxLength={4000}
          className="flex-1 rounded-[10px] border border-stroke-soft bg-glass-1 px-3 py-2 text-[13.5px] text-text-1 outline-none placeholder:text-text-3"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          title="Enviar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-glass-3 text-text-1 transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
        >
          <SendHorizontal size={16} strokeWidth={1.5} />
        </button>
      </form>
    </div>
  );
}
