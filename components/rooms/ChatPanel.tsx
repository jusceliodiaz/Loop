"use client";

import { X } from "lucide-react";
import { ChatThread } from "./ChatThread";

export function ChatPanel({
  roomId,
  roomName,
  currentUserId,
  onClose,
}: {
  roomId: string;
  roomName: string;
  currentUserId: string;
  onClose: () => void;
}) {
  return (
    <div
      className="stage-fade-in pointer-events-auto absolute inset-y-4 right-4 z-30 flex w-[340px] flex-col overflow-hidden rounded-[20px] border border-stroke bg-glass-dark backdrop-blur-2xl"
      style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
    >
      <header className="flex items-center justify-between border-b border-stroke-soft px-4 py-3">
        <h2 className="text-[14px] font-medium text-text-1">Chat · {roomName}</h2>
        <button
          onClick={onClose}
          title="Fechar chat"
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-3 hover:bg-glass-1 hover:text-text-1"
        >
          <X size={15} strokeWidth={1.5} />
        </button>
      </header>

      <ChatThread roomId={roomId} roomName={roomName} currentUserId={currentUserId} />
    </div>
  );
}
