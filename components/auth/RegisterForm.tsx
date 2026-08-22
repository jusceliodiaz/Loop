"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm text-[#98989F]">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          pattern="[a-z0-9_.]{3,32}"
          placeholder="juscelio"
          className="rounded-lg border border-white/10 bg-[#1D1D23] px-3 py-2 text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-[#98989F]">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-white/10 bg-[#1D1D23] px-3 py-2 text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-[#98989F]">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-lg border border-white/10 bg-[#1D1D23] px-3 py-2 text-[#F5F5F7] outline-none focus:border-[#7CF29C]"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-[#7CF29C] px-4 py-2 font-medium text-[#0D0D10] transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Criando conta..." : "Criar conta"}
      </button>
      <p className="text-center text-sm text-[#98989F]">
        Já tem conta?{" "}
        <Link href="/login" className="text-[#7CF29C] hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
