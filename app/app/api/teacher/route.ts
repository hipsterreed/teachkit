import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase-admin";
import { validateTeacherProfile } from "@/lib/validation";
import type { TeacherProfile, VoiceProfile } from "@/lib/types";

function getTeacherDoc(sessionId: string) {
  return db.doc(`teachers/${sessionId}`);
}

export async function GET(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ profile: null, voiceProfile: null, sessionId: null });
    }

    const doc = await getTeacherDoc(sessionId).get();
    if (!doc.exists) {
      return NextResponse.json({ profile: null, voiceProfile: null, sessionId });
    }

    const data = doc.data() as {
      profile?: TeacherProfile | null;
      voiceProfile?: VoiceProfile | null;
    };

    return NextResponse.json({
      profile: data.profile ?? null,
      voiceProfile: data.voiceProfile ?? null,
      sessionId,
    });
  } catch (error) {
    console.error("GET /api/teacher error:", error);
    return NextResponse.json({ error: "Failed to fetch teacher profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validation = validateTeacherProfile(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields: validation.missingFields },
        { status: 400 }
      );
    }

    const profile: TeacherProfile = {
      name: body.name,
      gradeLevel: body.gradeLevel,
      subject: body.subject,
      teachingTone: body.teachingTone,
    };

    // Use existing session or create a new one
    const sessionId = request.headers.get("x-session-id") || uuidv4();

    await getTeacherDoc(sessionId).set({ profile }, { merge: true });

    return NextResponse.json({ profile, sessionId }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/teacher error:", error);
    return NextResponse.json({ error: "Failed to save teacher profile" }, { status: 500 });
  }
}
