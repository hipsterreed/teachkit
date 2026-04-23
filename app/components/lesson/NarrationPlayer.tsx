"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";

export interface NarrationPlayerHandle {
  stop: () => void;
}

interface NarrationPlayerProps {
  src: string | null | undefined;
}

export const NarrationPlayer = forwardRef<NarrationPlayerHandle, NarrationPlayerProps>(
  function NarrationPlayer({ src }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
      stop: () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        }
      },
    }));

    if (!src) return null;

    const handleToggle = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    };

    return (
      <div className="flex items-center gap-3 bg-zinc-50 rounded-lg px-4 py-3">
        <audio
          ref={audioRef}
          src={src}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className="shrink-0"
          aria-label={isPlaying ? "Pause narration" : "Play narration"}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play Narration"}
        </Button>
        <span className="text-xs text-zinc-500">
          {isPlaying ? "Playing..." : "Listen to this page"}
        </span>
      </div>
    );
  }
);
