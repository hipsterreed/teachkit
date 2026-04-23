import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/firebase-admin";
import { buildRegenerationPrompt } from "@/lib/prompts";
import { applyPageContentChange } from "@/lib/lesson-logic";
import type { Lesson } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Params = Promise<{ lessonId: string; pageId: string }>;

function getLessonDoc(sessionId: string, lessonId: string) {
  return db.doc(`teachers/${sessionId}/lessons/${lessonId}`);
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { lessonId, pageId } = await params;
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

    const doc = await getLessonDoc(sessionId, lessonId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = doc.data() as Lesson;
    const pageIndex = lesson.pages.findIndex((p) => p.id === pageId);

    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const currentPage = lesson.pages[pageIndex];

    const brief = {
      title: lesson.title,
      topic: lesson.topic,
      objectives: lesson.objectives,
      inclusions: lesson.inclusions,
    };

    const prompt = buildRegenerationPrompt(
      lesson.teacherProfile,
      brief,
      currentPage.order,
      lesson.pages.length,
      currentPage.pageType
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: "AI regeneration failed" }, { status: 500 });
    }

    const rawJson = JSON.parse(rawContent);
    const rawPage = rawJson.page;

    if (!rawPage || typeof rawPage !== "object") {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    // Strip system fields and merge content fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, order, status, narrationUrl, ...contentFields } = rawPage;

    const updatedPage = applyPageContentChange(currentPage, contentFields);
    const updatedPages = [...lesson.pages];
    updatedPages[pageIndex] = updatedPage;

    await getLessonDoc(sessionId, lessonId).update({ pages: updatedPages });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("POST regenerate error:", error);
    return NextResponse.json({ error: "Failed to regenerate page" }, { status: 500 });
  }
}
