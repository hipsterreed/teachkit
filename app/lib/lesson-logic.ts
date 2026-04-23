import { v4 as uuidv4 } from "uuid";
import type { Page, Lesson } from "./types";

export function applyPageContentChange(
  page: Page,
  changes: Partial<Pick<Page, "title" | "body" | "example" | "activity">>
): Page {
  return {
    ...page,
    ...changes,
    status: "pending",
    narrationUrl: null,
  };
}

export function approveAllPages(lesson: Lesson): Lesson {
  return {
    ...lesson,
    pages: lesson.pages.map((page) => ({ ...page, status: "approved" })),
  };
}

export function canPublish(lesson: Lesson): boolean {
  return (
    lesson.pages.length > 0 &&
    lesson.pages.every((page) => page.status === "approved")
  );
}

export function buildTtsText(page: Page): string {
  return `${page.title}. ${page.body} Here is an example: ${page.example}. Now try this: ${page.activity}`;
}

interface RawPage {
  title: string;
  body: string;
  example: string;
  activity: string;
}

export function parseGeneratedPages(
  raw: { pages: RawPage[] },
  lessonId: string
): Page[] {
  if (!raw?.pages || !Array.isArray(raw.pages)) {
    throw new Error("Invalid AI response: missing pages array");
  }

  const count = raw.pages.length;
  if (count < 5 || count > 8) {
    throw new Error(
      `Invalid AI response: expected 5–8 pages, got ${count}`
    );
  }

  return raw.pages.map((rawPage, index) => {
    if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} missing title`);
    if (!rawPage.body?.trim()) throw new Error(`Page ${index + 1} missing body`);
    if (!rawPage.example?.trim()) throw new Error(`Page ${index + 1} missing example`);
    if (!rawPage.activity?.trim()) throw new Error(`Page ${index + 1} missing activity`);

    return {
      id: uuidv4(),
      order: index + 1,
      title: rawPage.title.trim(),
      body: rawPage.body.trim(),
      example: rawPage.example.trim(),
      activity: rawPage.activity.trim(),
      status: "pending",
      narrationUrl: null,
    };
  });
}
