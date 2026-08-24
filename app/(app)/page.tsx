import { ActivityCards } from "@/components/rooms/ActivityCards";
import { HomeMembersPanel } from "@/components/rooms/HomeMembersPanel";

export default function AppHomePage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-y-auto">
        <div className="ambient-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 px-8 py-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-[20px] font-semibold text-text-1">Bem-vindo de volta</h1>
            <p className="text-[14px] text-text-3">Um resumo de quem está por aqui e o que rolou nesta semana.</p>
          </div>
          <ActivityCards />
        </div>
      </div>

      <HomeMembersPanel />
    </div>
  );
}
