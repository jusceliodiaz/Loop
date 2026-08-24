import { ROOMS } from "@/config/rooms";

export default function AppHomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="ambient-light pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-[14.5px] text-text-2">
          Escolha uma sala para começar. Clique em <span className="text-text-1">{ROOMS[0]?.name ?? "uma sala"}</span> na
          barra lateral.
        </p>
      </div>
    </div>
  );
}
