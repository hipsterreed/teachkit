import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Lesson } from "@/lib/types";

function getLessonDoc(sessionId: string, lessonId: string) {
  return db.doc(`teachers/${sessionId}/lessons/${lessonId}`);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const sessionId = request.headers.get("x-session-id");

    // Allow public access for published lessons (student viewer)
    if (!sessionId) {
      // Search across all teachers for this lesson ID (for viewer mode)
      const snapshot = await db.collectionGroup("lessons")
        .where("id", "==", lessonId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      return NextResponse.json(snapshot.docs[0].data() as Lesson);
    }

    const doc = await getLessonDoc(sessionId, lessonId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(doc.data() as Lesson);
  } catch (error) {
    console.error("GET /api/lessons/[lessonId] error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
