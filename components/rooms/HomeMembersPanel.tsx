"use client";

import { AppMembersList } from "./AppMembersList";

export function HomeMembersPanel() {
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col overflow-y-auto border-l border-stroke-soft bg-bg-sidebar px-4 py-5 [@media(min-width:1100px)]:flex">
      <AppMembersList />
    </aside>
  );
}
