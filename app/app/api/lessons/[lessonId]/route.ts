import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Lesson } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const doc = await db.doc(`lessons/${lessonId}`).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(doc.data() as Lesson);
  } catch (error) {
    console.error("GET /api/lessons/[lessonId] error:", error);
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
