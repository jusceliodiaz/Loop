export type RoomType = "voice" | "text";

export type Room = {
  id: string;
  name: string;
  type: RoomType;
};

export const ROOMS: Room[] = [
  { id: "geral", name: "geral", type: "voice" },
  { id: "foco", name: "foco", type: "voice" },
  { id: "pausa", name: "pausa", type: "voice" },
  { id: "avisos", name: "avisos", type: "text" },
  { id: "duvidas", name: "dúvidas", type: "text" },
  { id: "random", name: "random", type: "text" },
];

export const VOICE_ROOMS = ROOMS.filter((r) => r.type === "voice");
export const TEXT_ROOMS = ROOMS.filter((r) => r.type === "text");
