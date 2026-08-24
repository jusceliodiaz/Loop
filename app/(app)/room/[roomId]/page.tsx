import { notFound } from "next/navigation";
import { ROOMS } from "@/config/rooms";
import { RoomStage } from "@/components/rooms/RoomStage";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) notFound();

  return <RoomStage roomId={room.id} roomName={room.name} />;
}
