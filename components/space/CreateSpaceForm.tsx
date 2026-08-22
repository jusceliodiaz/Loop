"use client";

import { useActionState } from "react";
import { createSpace, type CreateSpaceState } from "@/app/actions/space";

const initialState: CreateSpaceState = { error: null };

export function CreateSpaceForm() {
  const [state, formAction, pending] = useActionState(createSpace, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-[#98989F]">
          Nome do Space
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Factory"
          className="rounded-lg border border-white/10 bg-[#1D1D23] px-3 py-2 text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#7CF29C] px-4 py-2 font-medium text-[#0D0D10] transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Criando..." : "Criar Space"}
      </button>
    </form>
  );
}
