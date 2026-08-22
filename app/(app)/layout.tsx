import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("server_members")
    .select("servers(id, name)")
    .eq("user_id", user.id);

  type SpaceRef = { id: string; name: string };
  const spaces = (memberships ?? [])
    .map((m) => m.servers as unknown as SpaceRef | null)
    .filter((s): s is SpaceRef => Boolean(s));

  return (
    <div className="flex h-screen bg-[#0D0D10] text-[#F5F5F7]">
      <aside className="flex w-20 flex-col items-center gap-3 border-r border-white/5 bg-[#151519] py-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7CF29C] text-sm font-bold text-[#0D0D10]"
          title="LOOP"
        >
          L
        </Link>
        <div className="my-1 h-px w-8 bg-white/10" />
        <nav className="flex flex-1 flex-col items-center gap-2">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/space/${space.id}`}
              title={space.name}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D1D23] text-sm font-medium uppercase text-[#F5F5F7] transition hover:bg-[#26262E]"
            >
              {space.name.slice(0, 2)}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button
            type="submit"
            title="Sair"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#98989F] transition hover:bg-[#1D1D23] hover:text-[#F5F5F7]"
          >
            ⏻
          </button>
        </form>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
