import { Hash } from "lucide-react";
import { ChatThread } from "./ChatThread";
import { HomeMembersPanel } from "./HomeMembersPanel";

export function TextRoomStage({
  roomId,
  roomName,
  currentUserId,
}: {
  roomId: string;
  roomName: string;
  currentUserId: string;
}) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="ambient-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

        <header className="relative flex items-center gap-2 px-6 py-4">
          <Hash size={16} strokeWidth={1.5} className="text-text-3" />
          <h1 className="text-[14px] font-medium text-text-1">{roomName}</h1>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          <ChatThread roomId={roomId} roomName={roomName} currentUserId={currentUserId} variant="full" />
        </div>
      </div>

      <HomeMembersPanel />
    </div>
  );
}
