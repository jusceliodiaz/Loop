"use client";

import { useEffect, useState } from "react";
import { Hourglass, X } from "lucide-react";

export function CallEndedNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("loop:call-ended-reason") === "timeout") {
        sessionStorage.removeItem("loop:call-ended-reason");
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only exists client-side; this deliberately renders nothing on first paint to avoid a hydration mismatch
        setVisible(true);
      }
    } catch {
      // private mode / storage disabled — just skip the notice
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-stroke bg-glass-dark px-4 py-3 text-[13px] text-text-2 backdrop-blur-2xl">
      <Hourglass size={15} strokeWidth={1.5} className="shrink-0 text-text-3" />
      <span className="flex-1">
        A chamada foi encerrada automaticamente por atingir o limite de duração do seu plano.
      </span>
      <button
        onClick={() => setVisible(false)}
        title="Dispensar"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-3 hover:bg-glass-1 hover:text-text-1"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
