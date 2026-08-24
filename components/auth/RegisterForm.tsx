"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AtSign, Lock, Mail, TriangleAlert } from "lucide-react";
import { signUp, type AuthState } from "@/app/actions/auth";
import { FormField } from "./FormField";

const initialState: AuthState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <FormField
        id="username"
        name="username"
        label="Username"
        type="text"
        required
        pattern="[a-z0-9_.]{3,32}"
        placeholder="juscelio"
        icon={<AtSign size={16} strokeWidth={1.5} />}
      />
      <FormField id="email" name="email" label="E-mail" type="email" required autoComplete="email" icon={<Mail size={16} strokeWidth={1.5} />} />
      <FormField
        id="password"
        name="password"
        label="Senha"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
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
        {pending ? "Criando conta…" : "Criar conta"}
      </button>
      <p className="text-center text-[13px] text-text-3">
        Já tem conta?{" "}
        <Link href="/login" className="text-text-1 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
