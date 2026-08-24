"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
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
    <div className="stage-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-80 rounded-[20px] border border-stroke bg-glass-dark p-4 backdrop-blur-2xl"
        style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 px-1 text-[14px] font-medium text-text-1">Push-to-talk</h2>

        <label className="mb-2 flex h-10 items-center justify-between rounded-[10px] bg-glass-1 px-3 text-[14.5px] text-text-2">
          Ativar push-to-talk
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            className="h-4 w-4 accent-[var(--live)]"
          />
        </label>

        <button
          onClick={startCapture}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-text-2 transition-colors hover:bg-glass-1 hover:text-text-1"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-glass-1">
            <Keyboard size={15} strokeWidth={1.5} />
          </span>
          <span className="text-[14px] font-[450]">{capturing ? "Pressione uma tecla…" : `Tecla: ${keyLabel(config.key)}`}</span>
        </button>

        <p className="mt-3 px-1 text-[11.5px] text-text-3">
          Com push-to-talk ativo, o microfone fica fechado por padrão. Segure a tecla configurada (ou o botão do
          microfone) para falar.
        </p>
      </div>
    </div>
  );
}
