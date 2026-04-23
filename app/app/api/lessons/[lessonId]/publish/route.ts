import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { canPublish } from "@/lib/lesson-logic";
import type { Lesson } from "@/lib/types";

type Params = Promise<{ lessonId: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const { lessonId } = await params;

    const doc = await db.doc(`lessons/${lessonId}`).get();
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

    await db.doc(`lessons/${lessonId}`).update(updates);

    const publishedLesson: Lesson = { ...lesson, ...updates } as Lesson;
    return NextResponse.json(publishedLesson);
  } catch (error) {
    console.error("POST /api/lessons/[lessonId]/publish error:", error);
    return NextResponse.json({ error: "Failed to publish lesson" }, { status: 500 });
  }
}
