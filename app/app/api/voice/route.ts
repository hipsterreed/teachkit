import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { VoiceProfile } from "@/lib/types";

function getTeacherDoc(sessionId: string) {
  return db.doc(`teachers/${sessionId}`);
}

export async function GET(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ voiceProfile: null });
    }

    const doc = await getTeacherDoc(sessionId).get();
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
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

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

    await getTeacherDoc(sessionId).set({ voiceProfile }, { merge: true });

    return NextResponse.json({ voiceProfile });
  } catch (error) {
    console.error("PUT /api/voice error:", error);
    return NextResponse.json({ error: "Failed to save voice profile" }, { status: 500 });
  }
}
