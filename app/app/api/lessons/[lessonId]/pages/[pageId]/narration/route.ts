import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase-admin";
import { buildTtsText } from "@/lib/lesson-logic";
import type { Lesson, Page, VoiceProfile } from "@/lib/types";

type Params = Promise<{ lessonId: string; pageId: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const { lessonId, pageId } = await params;

    // Load lesson
    const doc = await db.doc(`lessons/${lessonId}`).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = doc.data() as Lesson;
    const pageIndex = lesson.pages.findIndex((p) => p.id === pageId);

    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const page = lesson.pages[pageIndex];

    // Get active voice profile
    const teacherDoc = await db.doc("teacher/default").get();
    const teacherData = teacherDoc.data() as {
      voiceProfile?: VoiceProfile | null;
    } | undefined;

    const voiceId =
      teacherData?.voiceProfile?.elevenLabsVoiceId ??
      process.env.ELEVENLABS_DEFAULT_VOICE_ID;

    if (!voiceId) {
      return NextResponse.json(
        { error: "No voice configured. Set ELEVENLABS_DEFAULT_VOICE_ID." },
        { status: 500 }
      );
    }

    // Build TTS text
    const ttsText = buildTtsText(page);

    // Call ElevenLabs TTS API
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: ttsText,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          output_format: "mp3_44100_128",
        }),
      }
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error("ElevenLabs TTS error:", errText);
      return NextResponse.json(
        { error: "Failed to generate narration audio. Please try again." },
        { status: 500 }
      );
    }

    // Upload audio to Firebase Storage
    const audioBuffer = Buffer.from(await elevenRes.arrayBuffer());
    const storagePath = `audio/${lessonId}/${pageId}.mp3`;
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    await file.save(audioBuffer, {
      metadata: { contentType: "audio/mpeg" },
    });

    // Make the file publicly readable and get download URL
    await file.makePublic();
    const narrationUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Update page: approved + narrationUrl
    const updatedPage: Page = {
      ...page,
      status: "approved",
      narrationUrl,
    };

    const updatedPages = [...lesson.pages];
    updatedPages[pageIndex] = updatedPage;

    await db.doc(`lessons/${lessonId}`).update({ pages: updatedPages });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("POST narration error:", error);
    return NextResponse.json(
      { error: "Failed to generate narration. Please try again." },
      { status: 500 }
    );
  }
}
