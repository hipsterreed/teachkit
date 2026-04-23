import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { VoiceProfile } from "@/lib/types";

const TEACHER_DOC = "teacher/default";

export async function GET() {
  try {
    const doc = await db.doc(TEACHER_DOC).get();
    if (!doc.exists) {
      return NextResponse.json({ voiceProfile: null });
    }
    const data = doc.data() as { voiceProfile?: VoiceProfile | null };
    return NextResponse.json({ voiceProfile: data.voiceProfile ?? null });
  } catch (error) {
    console.error("GET /api/voice error:", error);
    return NextResponse.json({ error: "Failed to fetch voice profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.type || !body.elevenLabsVoiceId) {
      return NextResponse.json(
        { error: "Missing required fields: type, elevenLabsVoiceId" },
        { status: 400 }
      );
    }

    const voiceProfile: VoiceProfile = {
      type: body.type,
      elevenLabsVoiceId: body.elevenLabsVoiceId,
      ...(body.createdAt ? { createdAt: body.createdAt } : {}),
    };

    await db.doc(TEACHER_DOC).set({ voiceProfile }, { merge: true });

    return NextResponse.json({ voiceProfile });
  } catch (error) {
    console.error("PUT /api/voice error:", error);
    return NextResponse.json({ error: "Failed to save voice profile" }, { status: 500 });
  }
}
