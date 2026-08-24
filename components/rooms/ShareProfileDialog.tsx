"use client";

import type { ScreenShareCaptureOptions } from "livekit-client";
import { Code2, Monitor, Sparkles } from "lucide-react";

export type ShareProfile = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  options: ScreenShareCaptureOptions;
};

export const SHARE_PROFILES: ShareProfile[] = [
  {
    id: "code",
    label: "Código",
    hint: "Código · 5 fps",
    icon: <Code2 size={16} strokeWidth={1.5} />,
    options: {
      resolution: { width: 1920, height: 1080, frameRate: 5 },
      contentHint: "detail",
      audio: true,
      surfaceSwitching: "include",
      selfBrowserSurface: "exclude",
    },
  },
  {
    id: "default",
    label: "Padrão",
    hint: "Padrão · 720p",
    icon: <Monitor size={16} strokeWidth={1.5} />,
    options: {
      resolution: { width: 1280, height: 720, frameRate: 30 },
      contentHint: "motion",
      audio: true,
      surfaceSwitching: "include",
      selfBrowserSurface: "exclude",
    },
  },
  {
    id: "hq",
    label: "Alta",
    hint: "Alta · 1080p",
    icon: <Sparkles size={16} strokeWidth={1.5} />,
    options: {
      resolution: { width: 1920, height: 1080, frameRate: 30 },
      contentHint: "motion",
      audio: true,
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
    <div className="stage-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-80 rounded-[20px] border border-stroke bg-glass-dark p-4 backdrop-blur-2xl"
        style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 px-1 text-[14px] font-medium text-text-1">Compartilhar tela</h2>
        <div className="flex flex-col gap-0.5">
          {SHARE_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-text-2 transition-colors hover:bg-glass-1 hover:text-text-1"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-glass-1 text-text-2">
                {profile.icon}
              </span>
              <span className="text-[14px] font-[450]">{profile.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
