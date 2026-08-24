"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, Mail, TriangleAlert } from "lucide-react";
import { signIn, type AuthState } from "@/app/actions/auth";
import { FormField } from "./FormField";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <FormField id="email" name="email" label="E-mail" type="email" required autoComplete="email" icon={<Mail size={16} strokeWidth={1.5} />} />
      <FormField
        id="password"
        name="password"
        label="Senha"
        type="password"
        required
        autoComplete="current-password"
        icon={<Lock size={16} strokeWidth={1.5} />}
      />

      {state.error && (
        <p className="flex items-center gap-2 rounded-[10px] border border-alert/25 bg-alert/10 px-3 py-2 text-[13px] text-alert">
          <TriangleAlert size={14} strokeWidth={1.5} className="shrink-0" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-[10px] bg-glass-3 px-4 py-2.5 text-[14.5px] font-medium text-text-1 transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-[13px] text-text-3">
        Ainda não tem conta?{" "}
        <Link href="/register" className="text-text-1 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
