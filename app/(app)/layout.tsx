import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { RoomSidebar } from "@/components/rooms/RoomSidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen bg-[#0D0D10] text-[#F5F5F7]">
      <aside className="flex w-56 flex-col border-r border-white/5 bg-[#151519]">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7CF29C] text-sm font-bold text-[#0D0D10]">
            L
          </span>
          <span className="text-sm font-semibold tracking-wide">LOOP</span>
        </div>
        <RoomSidebar />
        <form action={signOut} className="border-t border-white/5 p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#98989F] transition hover:bg-[#1D1D23] hover:text-[#F5F5F7]"
          >
            Sair
          </button>
        </form>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
