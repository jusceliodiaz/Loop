"use client";

import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { Loader2 } from "lucide-react";
import { StageInner } from "./StageInner";

export function RoomStage({ roomId, roomName }: { roomId: string; roomName: string }) {
  const router = useRouter();
  const [connection, setConnection] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomId }),
        });
        if (!res.ok) throw new Error("Não foi possível entrar na sala.");
        const data = await res.json();
        if (!cancelled) {
          setConnection({ token: data.token, url: data.url });
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Não foi possível entrar na sala. Tentando de novo em instantes…");
          setConnection(null);
        }
      }
    }

    connect();
    return () => {
      cancelled = true;
    };
  }, [roomId, retryKey]);

  if (error) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="ambient-light pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="flex items-center gap-2 text-[14.5px] text-text-2">
            <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
            {error}
          </p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="text-[13px] text-text-3 underline decoration-dotted underline-offset-4 hover:text-text-2"
          >
            Tentar agora
          </button>
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="ambient-light pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-1 flex-col items-center justify-center">
          <p className="flex items-center gap-2 text-[14.5px] text-text-2">
            <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
            Conectando ao áudio…
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={connection.token}
      serverUrl={connection.url}
      connect
      audio={{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
      className="flex flex-1 flex-col overflow-hidden"
      onDisconnected={() => router.push("/")}
    >
      <StageInner roomName={roomName} />
    </LiveKitRoom>
  );
}
