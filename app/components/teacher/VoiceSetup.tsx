"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VoiceProfile } from "@/lib/types";

const MIN_RECORDING_SECONDS = 30;

export function VoiceSetup() {
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchVoice = async () => {
      try {
        const res = await fetch("/api/voice");
        if (res.ok) {
          const data = await res.json();
          setVoiceProfile(data.voiceProfile);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVoice();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } catch {
      toast.error("Could not access microphone. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      await submitVoiceSample(audioBlob);
    };

    mediaRecorder.stop();
  };

  const submitVoiceSample = async (audioBlob: Blob) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-sample.webm");

      const res = await fetch("/api/voice/record", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to create voice clone. Using default voice.");
        return;
      }

      const data = await res.json();
      setVoiceProfile(data.voiceProfile);
      toast.success("Voice clone created! Your lessons will now use your voice.");
    } catch {
      toast.error("Failed to submit voice sample. Using default voice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToDefault = async () => {
    const defaultVoiceId = process.env.NEXT_PUBLIC_ELEVENLABS_DEFAULT_VOICE_ID;
    if (!defaultVoiceId) {
      toast.error("Default voice not configured.");
      return;
    }

    try {
      const res = await fetch("/api/voice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "default", elevenLabsVoiceId: defaultVoiceId }),
      });

      if (res.ok) {
        const data = await res.json();
        setVoiceProfile(data.voiceProfile);
        toast.success("Switched to default voice.");
      }
    } catch {
      toast.error("Failed to switch voice.");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading voice settings...</p>;

  return (
    <div className="space-y-4">
      {/* Current voice status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-700">Current voice:</span>
        {voiceProfile?.type === "clone" ? (
          <Badge variant="default">Your Voice</Badge>
        ) : (
          <Badge variant="secondary">Default AI Voice</Badge>
        )}
        {voiceProfile?.createdAt && (
          <span className="text-xs text-zinc-400">
            Created {new Date(voiceProfile.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Recording controls */}
      {isRecording ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-zinc-700">
              Recording {formatTime(elapsed)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={stopRecording}
            disabled={elapsed < MIN_RECORDING_SECONDS}
          >
            {elapsed < MIN_RECORDING_SECONDS
              ? `Stop (${MIN_RECORDING_SECONDS - elapsed}s min remaining)`
              : "Stop & Save"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startRecording}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "🎙 Record My Voice"}
          </Button>
          {voiceProfile?.type === "clone" && (
            <Button variant="ghost" size="sm" onClick={switchToDefault} disabled={isSubmitting}>
              Use Default Voice
            </Button>
          )}
        </div>
      )}

      <p className="text-xs text-zinc-400">
        Record at least 30 seconds of natural speech. ElevenLabs will clone your voice for
        narration.
      </p>
    </div>
  );
}
