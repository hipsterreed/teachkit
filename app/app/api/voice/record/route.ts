import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { VoiceProfile } from "@/lib/types";

function getTeacherDoc(sessionId: string) {
  return db.doc(`teachers/${sessionId}`);
}

export async function POST(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const teacherName = formData.get("teacherName") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const voiceName = teacherName ? `${teacherName} (TeachKit)` : "Teacher Voice";

    const elevenFormData = new FormData();
    elevenFormData.append("name", voiceName);
    elevenFormData.append("files", audioFile);

    const elevenRes = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "" },
      body: elevenFormData,
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error("ElevenLabs voice clone error:", errText);
      return NextResponse.json(
        { error: "Failed to create voice clone. Please try again." },
        { status: 500 }
      );
    }

    const elevenData = await elevenRes.json();
    const voiceId = elevenData.voice_id as string;

    if (!voiceId) {
      return NextResponse.json(
        { error: "ElevenLabs did not return a voice ID." },
        { status: 500 }
      );
    }

    const voiceProfile: VoiceProfile = {
      type: "clone",
      elevenLabsVoiceId: voiceId,
      createdAt: new Date().toISOString(),
    };

    await getTeacherDoc(sessionId).set({ voiceProfile }, { merge: true });

    return NextResponse.json({ voiceProfile });
  } catch (error) {
    console.error("POST /api/voice/record error:", error);
    return NextResponse.json(
      { error: "Failed to process voice recording. Please try again." },
      { status: 500 }
    );
  }
}
