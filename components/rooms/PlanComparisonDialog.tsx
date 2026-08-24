"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { PLANS, PLAN_ORDER, type PlanId } from "@/config/plans";
import { useAppUser } from "@/lib/appUser";

const FEATURES: { key: keyof (typeof PLANS)["pro"]; label: (v: unknown) => string }[] = [
  { key: "voice", label: (v) => (v ? "Salas de voz" : "Só texto") },
  { key: "monthlyShareHours", label: (v) => (Number(v) > 0 ? `${v}h de tela por mês` : "Sem compartilhar tela") },
  { key: "maxCallMinutes", label: (v) => `Chamadas de até ${v} min` },
  { key: "maxRoomsCreated", label: (v) => `Até ${v} salas criadas` },
];

export function PlanComparisonDialog({ onClose }: { onClose: () => void }) {
  const self = useAppUser();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [pendingPortal, setPendingPortal] = useState(false);

  async function checkout(plan: PlanId) {
    setPendingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.assign(url);
    } catch {
      setPendingPlan(null);
    }
  }

  async function openPortal() {
    setPendingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.assign(url);
    } catch {
      setPendingPortal(false);
    }
  }

  return (
    <div className="stage-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-[20px] border border-stroke bg-glass-dark p-5 backdrop-blur-2xl"
        style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-text-1">Planos</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-text-3 hover:bg-glass-1 hover:text-text-1">
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 [@media(min-width:640px)]:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const isCurrent = self.plan === id;
            const isPaid = id !== "free";

            return (
              <div
                key={id}
                className={`flex flex-col gap-3 rounded-[16px] border p-4 ${
                  isCurrent ? "border-supporter/40 bg-supporter-bg" : "border-stroke bg-glass-1"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-text-1">{plan.label}</span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-supporter">
                      <Check size={11} strokeWidth={1.5} />
                      atual
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-1.5 text-[12px] text-text-2">
                  {FEATURES.map((f) => (
                    <li key={f.key}>{f.label(plan[f.key])}</li>
                  ))}
                </ul>

                {isPaid && !isCurrent && (
                  <button
                    type="button"
                    onClick={() => checkout(id)}
                    disabled={pendingPlan !== null}
                    className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-supporter/40 bg-supporter/15 text-[12.5px] font-medium text-supporter transition-colors hover:bg-supporter/25 disabled:opacity-60"
                  >
                    {pendingPlan === id && <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />}
                    Assinar
                  </button>
                )}

                {isPaid && isCurrent && (
                  <button
                    type="button"
                    onClick={openPortal}
                    disabled={pendingPortal}
                    className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-glass-2 text-[12.5px] font-medium text-text-1 transition-colors hover:bg-glass-3 disabled:opacity-60"
                  >
                    {pendingPortal && <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />}
                    Gerenciar assinatura
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
