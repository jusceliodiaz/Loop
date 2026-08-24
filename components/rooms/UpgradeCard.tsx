import { Crown } from "lucide-react";

export function UpgradeCard() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-supporter/25 bg-supporter-bg p-4 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-glass-2 text-supporter">
        <Crown size={16} strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-medium text-text-1">Vire PRO</span>
        <p className="text-[11.5px] leading-snug text-text-3">
          Destaque seu nome nas salas e no chat com a tag de apoiador.
        </p>
      </div>
      <button
        type="button"
        className="w-full rounded-[10px] border border-supporter/40 bg-supporter/15 px-3 py-2 text-[12.5px] font-medium text-supporter transition-colors hover:bg-supporter/25"
      >
        Fazer upgrade
      </button>
    </div>
  );
}
