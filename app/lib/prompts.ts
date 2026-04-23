import type { TeacherProfile, LessonBrief } from "./types";

export function buildGenerationPrompt(
  profile: TeacherProfile,
  brief: LessonBrief
): string {
  const objectives = brief.objectives.map((o) => `- ${o}`).join("\n");
  const inclusions = brief.inclusions?.trim() || "None";

  return `You are an educational content writer. Generate a lesson for the following context.

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

Generate between 5 and 8 lesson pages. Each page must have:
- title: string
- body: string (student-facing content, grade-appropriate vocabulary)
- example: string (concrete, relatable example)
- activity: string (a question or short activity to reinforce the concept)

Respond with a JSON object: { "pages": [ { "title", "body", "example", "activity" } ] }
Do not include any text outside the JSON.`;
}

export function buildRegenerationPrompt(
  profile: TeacherProfile,
  brief: LessonBrief,
  pageOrder: number,
  totalPages: number
): string {
  const objectives = brief.objectives.map((o) => `- ${o}`).join("\n");
  const inclusions = brief.inclusions?.trim() || "None";

  return `You are an educational content writer. Regenerate ONE lesson page for the context below.
Produce a meaningfully different version — different angle, different example, different activity.

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

Respond with a JSON object: { "page": { "title", "body", "example", "activity" } }
Do not include any text outside the JSON.`;
}
