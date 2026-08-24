"use client";

import { useState } from "react";
import { keyLabel, type PushToTalkConfig } from "@/lib/pushToTalk";

export function PushToTalkSettings({
  config,
  onChange,
  onClose,
}: {
  config: PushToTalkConfig;
  onChange: (next: PushToTalkConfig) => void;
  onClose: () => void;
}) {
  const [capturing, setCapturing] = useState(false);

  function startCapture() {
    setCapturing(true);
    function onKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      window.removeEventListener("keydown", onKeyDown);
      setCapturing(false);
      onChange({ ...config, key: e.code });
    }
    window.addEventListener("keydown", onKeyDown);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-80 rounded-xl border border-white/10 bg-[#151519] p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-sm font-medium text-[#F5F5F7]">Push-to-talk</h2>

        <label className="mb-3 flex items-center justify-between text-sm text-[#F5F5F7]">
          Ativar push-to-talk
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
          />
        </label>

        <button
          onClick={startCapture}
          className="w-full rounded-lg border border-white/5 bg-[#1D1D23] px-3 py-2 text-left text-sm text-[#F5F5F7] transition hover:bg-[#26262E]"
        >
          {capturing ? "Pressione uma tecla…" : `Tecla: ${keyLabel(config.key)}`}
        </button>

        <p className="mt-3 text-xs text-[#98989F]">
          Com push-to-talk ativo, o microfone fica mudo por padrão. Segure a tecla configurada (ou o botão do
          microfone) para falar.
        </p>
      </div>
    </div>
  );
}
