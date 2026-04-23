import type { TeacherProfile, LessonBrief } from "./types";

export function buildGenerationPrompt(
  profile: TeacherProfile,
  brief: LessonBrief
): string {
  const objectives = brief.objectives.map((o) => `- ${o}`).join("\n");
  const inclusions = brief.inclusions?.trim() || "None";

  return `You are an expert curriculum designer creating structured, visually distinct classroom lesson slides.

Generate a lesson as a JSON array of pages. Each page has a "pageType" that determines its layout and fields.

LESSON STRUCTURE (follow this order exactly):
1. Page 1: pageType "title" — big title slide
2. Page 2: pageType "intro" — daily intro with objective, agenda, starter
3. Page 3: pageType "getting-started" — immediate actions, bell ringer, learning target
4. Pages 4 through N-1: mix of concept page types based on content (see below)
5. Last page: pageType "reflection" — open-ended reflection

CONCEPT PAGE TYPES (choose the best fit for each concept):
- "concept-bullets-image": use when a concept benefits from a visual alongside bullet points
- "concept-description-images": use when two images help illustrate a concept with a description
- "concept-bullets": use when a concept needs an intro sentence, bullets, and a follow-up activity

PAGE SCHEMAS:

{ "pageType": "title", "title": "...", "subtitle": "..." }
  - title: the lesson title (required)
  - subtitle: optional subtitle or grade/subject context

{ "pageType": "intro", "title": "Daily Intro", "objective": "I can...", "agenda": ["item1", "item2"], "starter": "...", "reminder": "..." }
  - objective: starts with "I can" — the learning goal
  - agenda: array of 1–3 agenda items
  - starter: a warm-up question for students
  - reminder: optional reminder (e.g. homework, materials)

{ "pageType": "getting-started", "title": "Getting Started", "thingsToDo": ["action1", "action2"], "bellRinger": "...", "learningTarget": "..." }
  - thingsToDo: array of 2–4 immediate actions students should take
  - bellRinger: a bell ringer question
  - learningTarget: the learning target statement

{ "pageType": "concept-bullets-image", "title": "...", "bullets": ["...", "..."], "imageDescription": "..." }
  - title: concept heading
  - bullets: 2–5 short bullet points
  - imageDescription: description of an image that would illustrate this concept

{ "pageType": "concept-description-images", "title": "...", "description": "...", "image1Description": "...", "image2Description": "..." }
  - title: concept heading
  - description: 1–2 sentence explanatory paragraph
  - image1Description: description of first image
  - image2Description: description of second image

{ "pageType": "concept-bullets", "title": "...", "body": "...", "bullets": ["...", "..."], "activity": "..." }
  - title: concept heading
  - body: one intro sentence
  - bullets: 2–5 bullet points
  - activity: a short activity or question for students

{ "pageType": "reflection", "title": "Reflection", "question": "...", "prompt": "..." }
  - question: an open-ended question for students
  - prompt: a "explain why..." or "describe how..." prompt

RULES:
- Generate 6–10 pages total
- Keep text short and student-friendly for the specified grade level
- Use simple, clear language — avoid long paragraphs
- Each concept page should focus on ONE idea

Teacher Profile:
- Grade Level: ${profile.gradeLevel}
- Subject: ${profile.subject}
- Teaching Tone: ${profile.teachingTone}

Lesson Brief:
- Title: ${brief.title}
- Topic: ${brief.topic}
- Learning Objectives:
${objectives}
- Specific Inclusions: ${inclusions}

Respond with a JSON object: { "pages": [ ...page objects... ] }
Do not include any text outside the JSON.`;
}

export function buildRegenerationPrompt(
  profile: TeacherProfile,
  brief: LessonBrief,
  pageOrder: number,
  totalPages: number,
  currentPageType?: string
): string {
  const objectives = brief.objectives.map((o) => `- ${o}`).join("\n");
  const inclusions = brief.inclusions?.trim() || "None";

  const pageTypeHint = currentPageType
    ? `The current page is of type "${currentPageType}". Regenerate it with the same pageType but meaningfully different content.`
    : `Choose the most appropriate pageType for this position in the lesson.`;

  return `You are an expert curriculum designer. Regenerate ONE lesson page for the context below.
Produce a meaningfully different version — different angle, different example, different activity.

${pageTypeHint}

PAGE SCHEMAS (use the matching schema for the pageType you choose):

{ "pageType": "concept-bullets-image", "title": "...", "bullets": ["...", "..."], "imageDescription": "..." }
{ "pageType": "concept-description-images", "title": "...", "description": "...", "image1Description": "...", "image2Description": "..." }
{ "pageType": "concept-bullets", "title": "...", "body": "...", "bullets": ["...", "..."], "activity": "..." }
{ "pageType": "intro", "title": "Daily Intro", "objective": "I can...", "agenda": ["..."], "starter": "...", "reminder": "..." }
{ "pageType": "getting-started", "title": "Getting Started", "thingsToDo": ["..."], "bellRinger": "...", "learningTarget": "..." }
{ "pageType": "reflection", "title": "Reflection", "question": "...", "prompt": "..." }
{ "pageType": "title", "title": "...", "subtitle": "..." }

Teacher Profile:
- Grade Level: ${profile.gradeLevel}
- Subject: ${profile.subject}
- Teaching Tone: ${profile.teachingTone}

Lesson Brief:
- Title: ${brief.title}
- Topic: ${brief.topic}
- Learning Objectives:
${objectives}
- Specific Inclusions: ${inclusions}

Page to regenerate: Page ${pageOrder} of ${totalPages}

Respond with a JSON object: { "page": { ...page fields including pageType... } }
Do not include any text outside the JSON.`;
}
