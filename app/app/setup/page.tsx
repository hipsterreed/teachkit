"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProfileForm } from "@/components/teacher/ProfileForm";
import { VoiceSetup } from "@/components/teacher/VoiceSetup";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LightRays } from "@/components/ui/light-rays";
import { setSessionId, getSessionId, sessionHeaders } from "@/lib/session";
import type { TeacherProfile } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionId, setLocalSessionId] = useState<string | null>(null);

  const handleProfileSubmit = async (profile: TeacherProfile) => {
    const res = await fetch("/api/teacher", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...sessionHeaders(), // include existing session if re-editing
      },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save profile. Please try again.");
      return;
    }

    const data = await res.json();
    const newSessionId: string = data.sessionId;

    // Persist session
    setSessionId(newSessionId);
    setLocalSessionId(newSessionId);

    setStep(2);
  };

  const handleFinish = () => {
    const id = sessionId ?? getSessionId();
    router.push(id ? `/?session=${id}` : "/");
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden flex flex-col items-center justify-center px-4 py-16">
      <LightRays color="rgba(120, 180, 255, 0.25)" count={8} speed={16} length="90vh" blur={40} />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Wordmark */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">TeachKit</h1>
          <p className="text-sm text-zinc-500">
            {step === 1 ? "Tell us about your classroom" : "Set up your voice narration"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {step > 1 ? "✓" : "1"}
            </div>
            <span className={`text-sm font-medium ${step === 1 ? "text-zinc-900" : "text-zinc-400"}`}>
              Classroom
            </span>
          </div>
          <div className={`flex-1 h-px ${step === 2 ? "bg-zinc-900" : "bg-zinc-200"}`} />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={`text-sm font-medium ${step === 2 ? "text-zinc-900" : "text-zinc-400"}`}>
              Voice
            </span>
            <div className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${step === 2 ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-400"}`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-200 shadow-sm p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-zinc-900">Your classroom</h2>
              <p className="text-sm text-zinc-500">
                This shapes every lesson the AI generates for you.
              </p>
            </div>
            <ProfileForm onSubmit={handleProfileSubmit} submitLabel="Continue →" />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-200 shadow-sm p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-zinc-900">Voice narration</h2>
              <p className="text-sm text-zinc-500">
                Record your voice once and every lesson will be narrated in it. You can always
                skip this and use the default AI voice.
              </p>
            </div>
            <Separator />
            <VoiceSetup />
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1 text-zinc-500" onClick={handleFinish}>
                Skip for now
              </Button>
              <Button className="flex-1" onClick={handleFinish}>
                Finish setup
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
