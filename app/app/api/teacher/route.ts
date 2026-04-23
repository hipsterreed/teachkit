import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { validateTeacherProfile } from "@/lib/validation";
import type { TeacherProfile, VoiceProfile } from "@/lib/types";

const TEACHER_DOC = "teacher/default";

export async function GET() {
  try {
    const doc = await db.doc(TEACHER_DOC).get();
    if (!doc.exists) {
      return NextResponse.json({ profile: null, voiceProfile: null });
    }
    const data = doc.data() as {
      profile?: TeacherProfile | null;
      voiceProfile?: VoiceProfile | null;
    };
    return NextResponse.json({
      profile: data.profile ?? null,
      voiceProfile: data.voiceProfile ?? null,
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
      gradeLevel: body.gradeLevel,
      subject: body.subject,
      teachingTone: body.teachingTone,
    };

    await db.doc(TEACHER_DOC).set({ profile }, { merge: true });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/teacher error:", error);
    return NextResponse.json({ error: "Failed to save teacher profile" }, { status: 500 });
  }
}
