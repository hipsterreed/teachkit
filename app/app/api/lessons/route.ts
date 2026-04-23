import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { db } from "@/lib/firebase-admin";
import { validateLessonBrief } from "@/lib/validation";
import { buildGenerationPrompt } from "@/lib/prompts";
import { parseGeneratedPages } from "@/lib/lesson-logic";
import type { Lesson, TeacherProfile, VoiceProfile } from "@/lib/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TEACHER_DOC = "teacher/default";

export async function GET() {
  try {
    const snapshot = await db
      .collection("lessons")
      .orderBy("createdAt", "desc")
      .get();

    const lessons = snapshot.docs.map((doc) => doc.data() as Lesson);
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("GET /api/lessons error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate brief
    const briefValidation = validateLessonBrief(body);
    if (!briefValidation.valid) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields: briefValidation.missingFields },
        { status: 400 }
      );
    }

    // Load teacher profile
    const teacherDoc = await db.doc(TEACHER_DOC).get();
    if (!teacherDoc.exists) {
      return NextResponse.json(
        { error: "Teacher profile not set. Please complete your profile first." },
        { status: 400 }
      );
    }

    const teacherData = teacherDoc.data() as {
      profile?: TeacherProfile | null;
      voiceProfile?: VoiceProfile | null;
    };

    if (!teacherData.profile) {
      return NextResponse.json(
        { error: "Teacher profile not set. Please complete your profile first." },
        { status: 400 }
      );
    }

    const profile = teacherData.profile;
    const brief = {
      title: body.title,
      topic: body.topic,
      objectives: Array.isArray(body.objectives) ? body.objectives : [body.objectives],
      inclusions: body.inclusions ?? null,
    };

    // Generate lesson with OpenAI
    const prompt = buildGenerationPrompt(profile, brief);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "AI generation failed. Please try again." },
        { status: 500 }
      );
    }

    const rawJson = JSON.parse(rawContent);
    const lessonId = uuidv4();
    const pages = parseGeneratedPages(rawJson, lessonId);

    const lesson: Lesson = {
      id: lessonId,
      title: brief.title,
      topic: brief.topic,
      objectives: brief.objectives,
      inclusions: brief.inclusions,
      status: "draft",
      pages,
      teacherProfile: profile,
      createdAt: new Date().toISOString(),
      publishedAt: null,
    };

    await db.doc(`lessons/${lessonId}`).set(lesson);

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("POST /api/lessons error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson. Please try again." },
      { status: 500 }
    );
  }
}
