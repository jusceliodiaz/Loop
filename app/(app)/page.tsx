import { ROOMS } from "@/config/rooms";

export default function AppHomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-lg font-medium text-[#F5F5F7]">Escolha uma sala</h1>
      <p className="max-w-sm text-sm text-[#98989F]">
        Clique em {ROOMS[0]?.name ?? "uma sala"} na barra lateral para entrar falando.
      </p>
    </div>
  );
}
