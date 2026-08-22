"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Author = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type ChatMessage = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  profiles: Author | Author[] | null;
};

function authorOf(message: ChatMessage): Author | null {
  return Array.isArray(message.profiles) ? (message.profiles[0] ?? null) : message.profiles;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function ChatRoom({
  channelId,
  channelName,
  currentUserId,
  initialMessages,
}: {
  channelId: string;
  channelName: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const row = payload.new as ChatMessage;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .eq("id", row.user_id)
            .single();
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, { ...row, profiles: profile }],
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? { ...m, content: row.content, edited_at: row.edited_at } : m)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const row = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== row.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setError(null);
    const { error: insertError } = await supabase
      .from("messages")
      .insert({ channel_id: channelId, user_id: currentUserId, content });
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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-white/5 px-4 py-3">
        <h1 className="text-sm font-semibold text-[#F5F5F7]"># {channelName}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-[#98989F]">
            Nenhuma mensagem ainda. Diga olá 👋
          </p>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const author = authorOf(message);
            const isOwn = message.user_id === currentUserId;
            const isEditing = editingId === message.id;

            return (
              <div key={message.id} className="group flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-[#F5F5F7]">
                    {author?.display_name || author?.username || "Usuário"}
                  </span>
                  <span className="text-xs text-[#98989F]">{formatTime(message.created_at)}</span>
                  {message.edited_at && <span className="text-xs text-[#98989F]">(editado)</span>}
                  {isOwn && !isEditing && (
                    <span className="ml-2 hidden gap-2 text-xs text-[#98989F] group-hover:inline-flex">
                      <button
                        type="button"
                        className="hover:text-[#F5F5F7]"
                        onClick={() => {
                          setEditingId(message.id);
                          setEditDraft(message.content);
                        }}
                      >
                        editar
                      </button>
                      <button
                        type="button"
                        className="hover:text-red-400"
                        onClick={() => handleDelete(message.id)}
                      >
                        excluir
                      </button>
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(message.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 rounded-md border border-white/10 bg-[#1D1D23] px-2 py-1 text-sm text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(message.id)}
                      className="text-xs text-[#7CF29C]"
                    >
                      salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-[#98989F]"
                    >
                      cancelar
                    </button>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-sm text-[#D5D5DA]">
                    {message.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-400">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-white/5 px-4 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Enviar mensagem em #${channelName}`}
          maxLength={4000}
          className="flex-1 rounded-lg border border-white/10 bg-[#1D1D23] px-3 py-2 text-sm text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-[#7CF29C] px-4 py-2 text-sm font-medium text-[#0D0D10] transition hover:opacity-90 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
