const STORAGE_KEY = "loop:ptt";

export type PushToTalkConfig = {
  enabled: boolean;
  key: string; // KeyboardEvent.code
};

const DEFAULT_CONFIG: PushToTalkConfig = { enabled: false, key: "Space" };

export function loadPushToTalkSettings(): PushToTalkConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      enabled: !!parsed.enabled,
      key: typeof parsed.key === "string" ? parsed.key : DEFAULT_CONFIG.key,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function savePushToTalkSettings(config: PushToTalkConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // private mode / quota exceeded — setting just won't persist
  }
}

export function keyLabel(code: string): string {
  if (code === "Space") return "Espaço";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code;
}
