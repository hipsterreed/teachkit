"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sessionHeaders } from "@/lib/session";
import type { VoiceProfile } from "@/lib/types";

const MIN_RECORDING_SECONDS = 30;

const READING_PROMPT = `Welcome to TeachKit. I'm your teacher, and today we're going to explore something really interesting together.

Learning is all about curiosity — asking questions, making connections, and discovering new ideas. Whether we're studying science, history, math, or language, every subject has a story to tell.

As we go through today's lesson, I want you to think carefully, take your time, and don't be afraid to make mistakes. That's how we grow. Let's get started — I'm excited to learn alongside you today.`;

export function VoiceSetup() {
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchVoice = async () => {
      try {
        const res = await fetch("/api/voice", { headers: sessionHeaders() });        if (res.ok) {
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
      setShowPrompt(false);
      await submitVoiceSample(audioBlob);
    };

    mediaRecorder.stop();
  };

  const submitVoiceSample = async (audioBlob: Blob) => {
    setIsSubmitting(true);
    try {
      // Fetch teacher name to label the voice in ElevenLabs
      let teacherName = "";
      try {
        const teacherRes = await fetch("/api/teacher", { headers: sessionHeaders() });
        if (teacherRes.ok) {
          const teacherData = await teacherRes.json();
          teacherName = teacherData.profile?.name ?? "";
        }
      } catch { /* non-critical */ }

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-sample.webm");
      if (teacherName) formData.append("teacherName", teacherName);

      const res = await fetch("/api/voice/record", {
        method: "POST",
        headers: sessionHeaders(),
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
        headers: { "Content-Type": "application/json", ...sessionHeaders() },
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading voice settings...</p>;

  return (
    <div className="space-y-4">
      {/* Current voice status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">Current voice:</span>
        {voiceProfile?.type === "clone" ? (
          <Badge variant="default">Your Voice</Badge>
        ) : (
          <Badge variant="secondary">Default AI Voice</Badge>
        )}
        {voiceProfile?.createdAt && (
          <span className="text-xs text-muted-foreground">
            Created {new Date(voiceProfile.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Reading prompt — shown before and during recording */}
      {(showPrompt || isRecording) && (
        <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Read this aloud
            </p>
            {isRecording && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium tabular-nums text-red-500">
                  {formatTime(elapsed)}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {READING_PROMPT}
          </p>
        </div>
      )}

      {/* Recording controls */}
      {isRecording ? (
        <Button
          variant="outline"
          size="sm"
          onClick={stopRecording}
          disabled={elapsed < MIN_RECORDING_SECONDS}
          className="w-full"
        >
          {elapsed < MIN_RECORDING_SECONDS
            ? `Keep reading… ${MIN_RECORDING_SECONDS - elapsed}s remaining`
            : "✓ Stop & Save Recording"}
        </Button>
      ) : (
        <div className="flex gap-2">
          {!showPrompt ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrompt(true)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Processing..." : "🎙 Record My Voice"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={startRecording}
              disabled={isSubmitting}
              className="flex-1"
            >
              Start Recording
            </Button>
          )}
          {voiceProfile?.type === "clone" && !showPrompt && (
            <Button variant="ghost" size="sm" onClick={switchToDefault} disabled={isSubmitting}>
              Use Default
            </Button>
          )}
        </div>
      )}

      {!showPrompt && !isRecording && (
        <p className="text-xs text-muted-foreground">
          We&apos;ll show you a short script to read — no need to improvise. ElevenLabs clones
          your voice from the recording.
        </p>
      )}
    </div>
  );
}
