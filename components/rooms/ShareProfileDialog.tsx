"use client";

import type { ScreenShareCaptureOptions } from "livekit-client";

export type ShareProfile = {
  id: string;
  label: string;
  hint: string;
  options: ScreenShareCaptureOptions;
};

export const SHARE_PROFILES: ShareProfile[] = [
  {
    id: "code",
    label: "Código / documento",
    hint: "1080p · 5 FPS · nítido para texto",
    options: {
      resolution: { width: 1920, height: 1080, frameRate: 5 },
      contentHint: "detail",
      surfaceSwitching: "include",
      selfBrowserSurface: "exclude",
    },
  },
  {
    id: "default",
    label: "Padrão",
    hint: "720p · 30 FPS",
    options: {
      resolution: { width: 1280, height: 720, frameRate: 30 },
      contentHint: "motion",
      surfaceSwitching: "include",
      selfBrowserSurface: "exclude",
    },
  },
  {
    id: "hq",
    label: "Alta qualidade",
    hint: "1080p · 30 FPS",
    options: {
      resolution: { width: 1920, height: 1080, frameRate: 30 },
      contentHint: "motion",
      surfaceSwitching: "include",
      selfBrowserSurface: "exclude",
    },
  },
];

export function ShareProfileDialog({
  onSelect,
  onClose,
}: {
  onSelect: (profile: ShareProfile) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-80 rounded-xl border border-white/10 bg-[#151519] p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-sm font-medium text-[#F5F5F7]">Compartilhar tela</h2>
        <div className="flex flex-col gap-2">
          {SHARE_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="rounded-lg border border-white/5 bg-[#1D1D23] px-3 py-2 text-left transition hover:bg-[#26262E]"
            >
              <div className="text-sm text-[#F5F5F7]">{profile.label}</div>
              <div className="text-xs text-[#98989F]">{profile.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
