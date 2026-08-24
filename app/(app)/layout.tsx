import { redirect } from "next/navigation";
import { CircleHelp, LogOut, Search, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { RoomSidebar } from "@/components/rooms/RoomSidebar";
import { SupporterBadge } from "@/components/rooms/SupporterBadge";
import { TopNav } from "@/components/rooms/TopNav";
import { UpgradeCard } from "@/components/rooms/UpgradeCard";
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
    .select("display_name, username, is_supporter")
    .eq("id", user.id)
    .single();
  const displayName = profile?.display_name ?? profile?.username ?? user.email ?? "Você";

  return (
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
          <RoomSidebar />

          <div className="mt-auto flex flex-col gap-3 pt-3">
            {!profile?.is_supporter && <UpgradeCard />}

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
                  {profile?.is_supporter && <SupporterBadge />}
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
