import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/firebase-admin";
import { buildRegenerationPrompt } from "@/lib/prompts";
import { applyPageContentChange } from "@/lib/lesson-logic";
import type { Lesson } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const brief = {
      title: lesson.title,
      topic: lesson.topic,
      objectives: lesson.objectives,
      inclusions: lesson.inclusions,
    };

    const prompt = buildRegenerationPrompt(
      lesson.teacherProfile,
      brief,
      lesson.pages[pageIndex].order,
      lesson.pages.length
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

    if (!rawPage?.title || !rawPage?.body || !rawPage?.example || !rawPage?.activity) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const updatedPage = applyPageContentChange(lesson.pages[pageIndex], {
      title: rawPage.title.trim(),
      body: rawPage.body.trim(),
      example: rawPage.example.trim(),
      activity: rawPage.activity.trim(),
    });

    const updatedPages = [...lesson.pages];
    updatedPages[pageIndex] = updatedPage;

    await db.doc(`lessons/${lessonId}`).update({ pages: updatedPages });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("POST regenerate error:", error);
    return NextResponse.json({ error: "Failed to regenerate page" }, { status: 500 });
  }
}
