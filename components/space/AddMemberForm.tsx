"use client";

import { useActionState } from "react";
import { addMember, type AddMemberState } from "@/app/actions/space";

const initialState: AddMemberState = { error: null, success: null };

export function AddMemberForm({ serverId }: { serverId: string }) {
  const [state, formAction, pending] = useActionState(addMember, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-white/5 px-2 py-3">
      <input type="hidden" name="serverId" value={serverId} />
      <label htmlFor="add-member-username" className="px-2 text-xs font-medium uppercase tracking-wide text-[#98989F]">
        Adicionar pessoa
      </label>
      <div className="flex gap-1 px-2">
        <input
          id="add-member-username"
          name="username"
          placeholder="username"
          required
          className="flex-1 rounded-md border border-white/10 bg-[#1D1D23] px-2 py-1 text-sm text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#7CF29C] px-2 py-1 text-xs font-medium text-[#0D0D10] transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "..." : "Add"}
        </button>
      </div>
      {state.error && <p className="px-2 text-xs text-red-400">{state.error}</p>}
      {state.success && <p className="px-2 text-xs text-[#7CF29C]">{state.success}</p>}
    </form>
  );
}
