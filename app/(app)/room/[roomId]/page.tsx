import { notFound, redirect } from "next/navigation";
import { ROOMS } from "@/config/rooms";
import { RoomStage } from "@/components/rooms/RoomStage";
import { TextRoomStage } from "@/components/rooms/TextRoomStage";
import { createClient } from "@/lib/supabase/server";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) notFound();

  if (room.type === "text") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return <TextRoomStage roomId={room.id} roomName={room.name} currentUserId={user.id} />;
  }

  return <RoomStage roomId={room.id} roomName={room.name} />;
}
