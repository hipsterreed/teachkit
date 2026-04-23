import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { canPublish } from "@/lib/lesson-logic";
import type { Lesson } from "@/lib/types";

type Params = Promise<{ lessonId: string }>;

function getLessonDoc(sessionId: string, lessonId: string) {
  return db.doc(`teachers/${sessionId}/lessons/${lessonId}`);
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { lessonId } = await params;
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

    const doc = await getLessonDoc(sessionId, lessonId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = doc.data() as Lesson;

    if (!canPublish(lesson)) {
      const pendingCount = lesson.pages.filter((p) => p.status === "pending").length;
      return NextResponse.json(
        {
          error: `Cannot publish: ${pendingCount} page${pendingCount === 1 ? "" : "s"} still pending approval.`,
          pendingCount,
        },
        { status: 400 }
      );
    }

    const updates = {
      status: "published",
      publishedAt: new Date().toISOString(),
    };

    await getLessonDoc(sessionId, lessonId).update(updates);

    return NextResponse.json({ ...lesson, ...updates } as Lesson);
  } catch (error) {
    console.error("POST publish error:", error);
    return NextResponse.json({ error: "Failed to publish lesson" }, { status: 500 });
  }
}
