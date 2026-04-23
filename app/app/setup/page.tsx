"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProfileForm } from "@/components/teacher/ProfileForm";
import { VoiceSetup } from "@/components/teacher/VoiceSetup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeacherProfile } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();

  const handleSubmit = async (profile: TeacherProfile) => {
    const res = await fetch("/api/teacher", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save profile. Please try again.");
      return;
    }

    toast.success("Profile saved!");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-md mx-auto py-12 space-y-6">
        {/* Profile setup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Set Up Your Profile</CardTitle>
            <CardDescription>
              Tell us about your classroom so we can tailor every lesson to your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm onSubmit={handleSubmit} submitLabel="Save & Continue" />
          </CardContent>
        </Card>

        {/* Voice setup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice Narration</CardTitle>
            <CardDescription>
              Optionally record your voice so lessons are narrated in your voice. You can skip
              this and use the default AI voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceSetup />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
