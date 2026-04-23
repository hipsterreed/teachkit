export interface TeacherProfile {
  gradeLevel: string; // "Kindergarten" | "Grade 1" … "Grade 12"
  subject: string; // free text, e.g. "Biology"
  teachingTone: "Fun" | "Structured" | "Simple" | "Engaging";
}

export interface VoiceProfile {
  type: "default" | "clone";
  elevenLabsVoiceId: string; // default voice ID or cloned voice ID from ElevenLabs
  createdAt?: string; // ISO timestamp, set when clone is created
}

export interface Page {
  id: string; // uuid
  order: number; // 1-based position in lesson
  title: string;
  body: string; // student-facing body content
  example: string; // concrete example
  activity: string; // activity or question
  status: "pending" | "approved";
  narrationUrl: string | null; // Firebase Storage download URL (null until approved)
}

export interface Lesson {
  id: string; // uuid, also used as the shareable link slug
  title: string;
  topic: string;
  objectives: string[];
  inclusions: string | null; // optional
  status: "draft" | "published";
  pages: Page[];
  teacherProfile: TeacherProfile; // snapshot at generation time
  createdAt: string; // ISO timestamp
  publishedAt: string | null;
}

export interface LessonBrief {
  title: string;
  topic: string;
  objectives: string[];
  inclusions?: string | null;
}
