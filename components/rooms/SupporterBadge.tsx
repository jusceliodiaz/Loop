import { Zap } from "lucide-react";

export function SupporterBadge() {
  return (
    <span
      title="Apoiador"
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-supporter/40 bg-supporter-bg px-2 py-0.5 text-[10px] font-medium text-supporter"
    >
      <Zap size={10} strokeWidth={1.5} />
      PRO
    </span>
  );
}
