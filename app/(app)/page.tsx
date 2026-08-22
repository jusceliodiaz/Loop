import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateSpaceForm } from "@/components/space/CreateSpaceForm";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("server_members")
    .select("server_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) redirect(`/space/${membership.server_id}`);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold text-[#F5F5F7]">Crie seu primeiro Space</h1>
        <p className="max-w-sm text-sm text-[#98989F]">
          Um Space é onde as suas Rooms e People vivem. Comece criando um.
        </p>
      </div>
      <CreateSpaceForm />
    </div>
  );
}
