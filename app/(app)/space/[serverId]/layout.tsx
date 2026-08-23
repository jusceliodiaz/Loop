import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddMemberForm } from "@/components/space/AddMemberForm";
import { CreateRoomForm } from "@/components/space/CreateRoomForm";

export default async function SpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: server }, { data: channels }, { data: members }] = await Promise.all([
    supabase.from("servers").select("id, name").eq("id", serverId).maybeSingle(),
    supabase
      .from("channels")
      .select("id, name, type")
      .eq("server_id", serverId)
      .order("created_at", { ascending: true }),
    supabase
      .from("server_members")
      .select("user_id, role, profiles(id, username, display_name)")
      .eq("server_id", serverId),
  ]);

  if (!server) notFound();

  const isOwner = (members ?? []).some((m) => m.user_id === user.id && m.role === "owner");

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="flex w-56 flex-col border-r border-white/5 bg-[#151519]">
        <div className="border-b border-white/5 px-4 py-4">
          <h2 className="truncate text-sm font-semibold text-[#F5F5F7]">{server.name}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-[#98989F]">
            Rooms
          </p>
          <nav className="flex flex-col gap-0.5">
            {(channels ?? []).map((channel) => (
              <Link
                key={channel.id}
                href={`/space/${serverId}/${channel.id}`}
                className="rounded-md px-2 py-1.5 text-sm text-[#98989F] transition hover:bg-[#1D1D23] hover:text-[#F5F5F7]"
              >
                {channel.type === "voice" ? "🔊" : "#"} {channel.name}
              </Link>
            ))}
          </nav>
        </div>
        {isOwner && <CreateRoomForm serverId={serverId} />}
      </aside>
      <div className="flex flex-1 overflow-hidden">{children}</div>
      <aside className="flex w-56 flex-col border-l border-white/5 bg-[#151519]">
        <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-[#98989F]">
          People — {members?.length ?? 0}
        </p>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {(members ?? []).map((m) => {
            const profile = m.profiles as unknown as {
              id: string;
              username: string;
              display_name: string | null;
            } | null;
            if (!profile) return null;
            return (
              <div
                key={m.user_id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[#F5F5F7]"
              >
                <span className="h-2 w-2 rounded-full bg-[#7CF29C]" />
                {profile.display_name || profile.username}
              </div>
            );
          })}
        </div>
        {isOwner && <AddMemberForm serverId={serverId} />}
      </aside>
    </div>
  );
}
