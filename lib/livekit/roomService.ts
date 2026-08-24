import { RoomServiceClient } from "livekit-server-sdk";

function httpUrl() {
  return process.env.LIVEKIT_URL!.replace(/^ws/, "http");
}

export function getRoomServiceClient() {
  return new RoomServiceClient(httpUrl(), process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);
}
