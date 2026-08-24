"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "livekit-client";
import { ambientFromIdentity, defaultAmbient, sampleAmbientFromVideo, type AmbientTriple } from "./ambientLight";

/**
 * Colors the ambient light from whatever is happening in the room: the shared
 * screen when there is one, the speaking participant's identity otherwise, or
 * the resting default. Sampling every 2s keeps the canvas read cheap.
 */
export function useAmbientLight({
  activeShareTrack,
  speakingIdentity,
}: {
  activeShareTrack: Track | undefined;
  speakingIdentity: string | undefined;
}): AmbientTriple {
  const [sampled, setSampled] = useState<AmbientTriple | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!activeShareTrack) return;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    activeShareTrack.attach(video);
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return () => {
        activeShareTrack.detach(video);
      };
    }

    function tick() {
      if (document.hidden) return; // nobody's looking — don't burn CPU/battery drawing frames
      const canvas = canvasRef.current;
      if (canvas && video.readyState >= 2) {
        const result = sampleAmbientFromVideo(video, canvas);
        if (result) setSampled(result);
      }
    }

    const interval = setInterval(tick, 2000);
    const firstFrame = setTimeout(tick, 0);

    return () => {
      clearInterval(interval);
      clearTimeout(firstFrame);
      activeShareTrack.detach(video);
    };
  }, [activeShareTrack]);

  return useMemo(() => {
    if (activeShareTrack) return sampled ?? defaultAmbient();
    if (speakingIdentity) return ambientFromIdentity(speakingIdentity);
    return defaultAmbient();
  }, [activeShareTrack, sampled, speakingIdentity]);
}
