"use client";

import { useActionState, useRef } from "react";
import { createRoom, type CreateRoomState } from "@/app/actions/space";

const initialState: CreateRoomState = { error: null };

export function CreateRoomForm({ serverId }: { serverId: string }) {
  const [state, formAction, pending] = useActionState(createRoom, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-1.5 px-2 pb-2"
    >
      <input type="hidden" name="serverId" value={serverId} />
      <div className="flex gap-1">
        <input
          name="name"
          placeholder="nova-room"
          required
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-[#1D1D23] px-2 py-1 text-sm text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
        <select
          name="type"
          defaultValue="text"
          className="rounded-md border border-white/10 bg-[#1D1D23] px-1 text-sm text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        >
          <option value="text">texto</option>
          <option value="voice">voz</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#7CF29C] px-2 py-1 text-xs font-medium text-[#0D0D10] transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "..." : "+"}
        </button>
      </div>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
