import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { applyPageContentChange } from "@/lib/lesson-logic";
import type { Lesson, Page } from "@/lib/types";

type Params = Promise<{ lessonId: string; pageId: string }>;

function getLessonDoc(sessionId: string, lessonId: string) {
  return db.doc(`teachers/${sessionId}/lessons/${lessonId}`);
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const { lessonId, pageId } = await params;
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

    const body = await request.json();
    const doc = await getLessonDoc(sessionId, lessonId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = doc.data() as Lesson;
    const pageIndex = lesson.pages.findIndex((p) => p.id === pageId);

    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const changes: Partial<Pick<Page, "title" | "body" | "example" | "activity">> = {};
    if (body.title !== undefined) changes.title = body.title;
    if (body.body !== undefined) changes.body = body.body;
    if (body.example !== undefined) changes.example = body.example;
    if (body.activity !== undefined) changes.activity = body.activity;

    const updatedPage = applyPageContentChange(lesson.pages[pageIndex], changes);
    const updatedPages = [...lesson.pages];
    updatedPages[pageIndex] = updatedPage;

    await getLessonDoc(sessionId, lessonId).update({ pages: updatedPages });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("PATCH page error:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}
