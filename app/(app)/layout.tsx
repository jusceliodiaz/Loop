import { redirect } from "next/navigation";
import { CircleHelp, Hourglass, LogOut, Search, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRooms } from "@/lib/rooms";
import { getPlanState } from "@/lib/getPlan";
import { AppUserProvider } from "@/lib/appUser";
import { signOut } from "@/app/actions/auth";
import { RoomSidebar } from "@/components/rooms/RoomSidebar";
import { SupporterBadge } from "@/components/rooms/SupporterBadge";
import { TopNav } from "@/components/rooms/TopNav";
import { UpgradeCard } from "@/components/rooms/UpgradeCard";
import { UnreadTitleWatcher } from "@/components/rooms/UnreadTitleWatcher";
import {
  SidebarDrawer,
  SidebarDrawerFloatingToggle,
  SidebarDrawerProvider,
  SidebarDrawerToggle,
} from "@/components/rooms/SidebarDrawer";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, role, approved")
    .eq("id", user.id)
    .single();

  if (!profile?.approved) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-shell px-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-glass-2 text-text-2">
            <Hourglass size={18} strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[15px] font-medium text-text-1">Esperando aprovação</h1>
            <p className="text-[13.5px] leading-relaxed text-text-3">
              Sua conta foi criada, mas alguém do grupo precisa te aprovar antes de você ver as salas. Avise um admin.
            </p>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-[13px] text-text-3 underline decoration-dotted underline-offset-4 hover:text-text-2">
              Sair
            </button>
          </form>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name ?? profile.username ?? user.email ?? "Você";
  const role = profile.role === "admin" ? "admin" : "member";
  const [rooms, planState] = await Promise.all([getRooms(), getPlanState(supabase, user.id)]);

  return (
    <AppUserProvider user={{ id: user.id, role, plan: planState.id }}>
      <UnreadTitleWatcher rooms={rooms} />
      <SidebarDrawerProvider>
        <div className="relative flex h-screen w-full overflow-hidden bg-bg-shell">
          <SidebarDrawer>
            <div className="mb-7 flex items-center justify-between">
              <span className="text-[17px] font-semibold text-text-1">LOOP</span>
              <SidebarDrawerToggle />
            </div>

            <span className="mb-3 px-2.5 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">Menu</span>
            <TopNav />

            <span className="mt-7 mb-3 px-2.5 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">Salas</span>
            <RoomSidebar rooms={rooms} canJoinVoice={planState.plan.voice} />

            <div className="mt-auto flex flex-col gap-3 pt-3">
              <UpgradeCard />

              <div className="flex flex-col gap-0.5">
                <NavItem icon={Settings} label="Configurações" />
                <NavItem icon={CircleHelp} label="Ajuda" />
              </div>

              <div className="flex items-center gap-2.5 rounded-[14px] bg-glass-2 p-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                  {initials(displayName)}
                </span>
                <span className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate text-sm font-medium text-text-1">
                    <span className="truncate">{displayName}</span>
                    {planState.id === "pro" && <SupporterBadge />}
                  </div>
                  <div className="truncate text-xs text-text-3">{user.email}</div>
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    title="Sair da conta"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-3 transition-colors hover:bg-glass-1 hover:text-alert"
                  >
                    <LogOut size={15} strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            </div>
          </SidebarDrawer>

          <div className="flex flex-1 flex-col overflow-hidden bg-bg-stage">
            <div className="flex items-center gap-2 px-4 pt-4">
              <SidebarDrawerFloatingToggle />
            </div>
            {children}
          </div>
        </div>
      </SidebarDrawerProvider>
    </AppUserProvider>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Search;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14.5px] transition-colors ${
        active ? "bg-glass-2 text-text-1" : "text-text-2 hover:bg-glass-1 hover:text-text-1"
      }`}
    >
      <Icon size={17} strokeWidth={1.5} />
      {label}
    </button>
  );
}
