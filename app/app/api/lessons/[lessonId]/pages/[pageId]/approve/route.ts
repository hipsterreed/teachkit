import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { Lesson, Page } from "@/lib/types";

type Params = Promise<{ lessonId: string; pageId: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const { lessonId, pageId } = await params;

    const doc = await db.doc(`lessons/${lessonId}`).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = doc.data() as Lesson;
    const pageIndex = lesson.pages.findIndex((p) => p.id === pageId);

    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updatedPage: Page = { ...lesson.pages[pageIndex], status: "approved" };
    const updatedPages = [...lesson.pages];
    updatedPages[pageIndex] = updatedPage;

    await db.doc(`lessons/${lessonId}`).update({ pages: updatedPages });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("POST approve error:", error);
    return NextResponse.json({ error: "Failed to approve page" }, { status: 500 });
  }
}
