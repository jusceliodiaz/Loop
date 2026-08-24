"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { useAppUser } from "@/lib/appUser";
import { PlanComparisonDialog } from "./PlanComparisonDialog";

export function UpgradeCard() {
  const self = useAppUser();
  const [open, setOpen] = useState(false);
  const isFree = self.plan === "free";

  return (
    <>
      <div className="flex flex-col items-center gap-3 rounded-[16px] border border-supporter/25 bg-supporter-bg p-4 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-glass-2 text-supporter">
          <Crown size={16} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-text-1">{isFree ? "Vire Basic ou Pro" : `Você é ${self.plan}`}</span>
          <p className="text-[11.5px] leading-snug text-text-3">
            {isFree
              ? "Libere salas de voz e compartilhamento de tela."
              : "Veja os planos ou gerencie sua assinatura."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-[10px] border border-supporter/40 bg-supporter/15 px-3 py-2 text-[12.5px] font-medium text-supporter transition-colors hover:bg-supporter/25"
        >
          Ver planos
        </button>
      </div>

      {open && <PlanComparisonDialog onClose={() => setOpen(false)} />}
    </>
  );
}
