import { ActivityCards } from "@/components/rooms/ActivityCards";
import { CallEndedNotice } from "@/components/rooms/CallEndedNotice";
import { ConversationCards } from "@/components/rooms/ConversationCards";
import { HomeHero } from "@/components/rooms/HomeHero";
import { HomeMembersPanel } from "@/components/rooms/HomeMembersPanel";
import { PeopleCards } from "@/components/rooms/PeopleCards";
import { createClient } from "@/lib/supabase/server";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName = "";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("display_name, username").eq("id", user.id).single();
    const fullName = profile?.display_name ?? profile?.username ?? user.email ?? "";
    firstName = fullName.split(/\s+/)[0] ?? "";
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-y-auto">
        <div className="ambient-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col gap-8 px-8 py-6">
          <CallEndedNotice />
          <HomeHero name={firstName} />

          <div className="flex flex-col gap-2">
            <h2 className="px-1 text-[13px] font-medium text-text-2">Salas de voz esta semana</h2>
            <ActivityCards />
          </div>

          <ConversationCards />
          <PeopleCards />
        </div>
      </div>

      <HomeMembersPanel />
    </div>
  );
}
