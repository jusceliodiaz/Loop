import { redirect } from "next/navigation";
import { CircleHelp, Home, Info, LogOut, Search, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { RoomSidebar } from "@/components/rooms/RoomSidebar";
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

const NAV_ITEMS = [
  { icon: Home, label: "Início", active: true },
  { icon: Search, label: "Buscar" },
  { icon: Info, label: "Sobre a LOOP" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("display_name, username").eq("id", user.id).single();
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
          <nav className="mb-1 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} icon={item.icon} label={item.label} active={item.active} />
            ))}
          </nav>

          <span className="mt-7 mb-3 px-2.5 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">Salas</span>
          <RoomSidebar />

          <div className="mt-auto flex flex-col gap-0.5 pt-3">
            <NavItem icon={Settings} label="Configurações" />
            <NavItem icon={CircleHelp} label="Ajuda" />

            <div className="mt-2 flex items-center gap-2.5 rounded-[14px] bg-glass-2 p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                {initials(displayName)}
              </span>
              <span className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-text-1">{displayName}</div>
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
