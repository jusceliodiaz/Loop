"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Shield } from "lucide-react";
import { PLAN_ORDER, type PlanId } from "@/config/plans";
import { adminSetPlan, approveMember, setMemberRole } from "@/app/actions/admin";
import { useAppUser } from "@/lib/appUser";
import { SupporterBadge } from "./SupporterBadge";

export type Member = {
  id: string;
  name: string;
  online: boolean;
  role: "admin" | "member";
  approved: boolean;
  plan: PlanId;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function useAppMembers() {
  const [members, setMembers] = useState<Member[]>([]);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members ?? []);
    } catch {
      // ignore transient network errors, next poll will retry
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount, same pattern as the interval tick
    poll();
    const interval = setInterval(poll, 15_000);
    return () => clearInterval(interval);
  }, [poll]);

  return { members, refresh: poll };
}

function Avatar({ name, online }: { name: string; online: boolean }) {
  return (
    <span className="relative shrink-0">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] font-medium text-white ${
          online ? "" : "opacity-40"
        }`}
      >
        {initials(name)}
      </span>
      <span
        className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-sidebar ${
          online ? "bg-live" : "border-text-3 bg-transparent"
        }`}
      />
    </span>
  );
}

export function MemberRow({
  name,
  online,
  plan,
  admin,
}: {
  name: string;
  online: boolean;
  plan?: PlanId;
  admin?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 ${online ? "text-text-1" : "text-text-3"}`}>
      <Avatar name={name} online={online} />
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-[14px] font-[450]">{name}</span>
        {admin && <Shield size={12} strokeWidth={1.5} className="shrink-0 text-text-3" />}
        {plan === "pro" && <SupporterBadge />}
      </span>
    </div>
  );
}

function AdminMemberRow({ member, onChanged }: { member: Member; onChanged: () => void }) {
  const self = useAppUser();
  const isSelf = member.id === self.id;

  if (!member.approved) {
    return (
      <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-text-2">
        <Avatar name={member.name} online={false} />
        <span className="min-w-0 flex-1 truncate text-[14px] font-[450]">{member.name}</span>
        <button
          type="button"
          title="Aprovar entrada no grupo"
          onClick={async () => {
            await approveMember(member.id);
            onChanged();
          }}
          className="flex h-6 items-center gap-1 rounded-md bg-glass-2 px-2 text-[11px] font-medium text-text-1 transition-colors hover:bg-glass-3"
        >
          <Check size={12} strokeWidth={1.5} />
          Aprovar
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 ${member.online ? "text-text-1" : "text-text-3"}`}>
      <Avatar name={member.name} online={member.online} />
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-[14px] font-[450]">{member.name}</span>
        {member.role === "admin" && <Shield size={12} strokeWidth={1.5} className="shrink-0 text-text-3" />}
        {member.plan === "pro" && <SupporterBadge />}
      </span>
      {!isSelf && (
        <span className="flex shrink-0 items-center gap-1">
          <select
            value={member.plan}
            title="Plano (concessão manual, sem passar pela Stripe)"
            onChange={async (e) => {
              await adminSetPlan(member.id, e.target.value as PlanId);
              onChanged();
            }}
            className="h-6 rounded-md bg-glass-1 px-1 text-[10px] text-text-2 outline-none"
          >
            {PLAN_ORDER.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <button
            type="button"
            title={member.role === "admin" ? "Remover admin" : "Tornar admin"}
            onClick={async () => {
              await setMemberRole(member.id, member.role === "admin" ? "member" : "admin");
              onChanged();
            }}
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-glass-2 ${
              member.role === "admin" ? "text-text-1" : "text-text-3"
            }`}
          >
            <Shield size={13} strokeWidth={1.5} />
          </button>
        </span>
      )}
    </div>
  );
}

export function AppMembersList() {
  const { members, refresh } = useAppMembers();
  const self = useAppUser();
  const isAdmin = self.role === "admin";
  const pending = members.filter((m) => !m.approved);
  const online = members.filter((m) => m.approved && m.online);
  const offline = members.filter((m) => m.approved && !m.online);

  const Row = isAdmin
    ? (m: Member) => <AdminMemberRow key={m.id} member={m} onChanged={refresh} />
    : (m: Member) => <MemberRow key={m.id} name={m.name} online={m.online} plan={m.plan} admin={m.role === "admin"} />;

  return (
    <div className="flex flex-col gap-0.5">
      {isAdmin && pending.length > 0 && (
        <>
          <span className="mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
            Aguardando aprovação — {pending.length}
          </span>
          {pending.map(Row)}
        </>
      )}

      <span className="mt-4 mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase first:mt-0">
        Todo o LOOP — {online.length} online
      </span>
      {online.map(Row)}
      {offline.length > 0 && (
        <>
          <span className="mt-4 mb-2 px-2 text-[11px] font-medium tracking-[0.09em] text-text-3 uppercase">
            Offline — {offline.length}
          </span>
          {offline.map(Row)}
        </>
      )}
    </div>
  );
}
