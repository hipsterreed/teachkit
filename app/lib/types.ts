export interface TeacherProfile {
  name: string; // teacher's name
  gradeLevel: string; // "Kindergarten" | "Grade 1" … "Grade 12"
  subject: string; // free text, e.g. "Biology"
  teachingTone: "Fun" | "Structured" | "Simple" | "Engaging";
}

export interface VoiceProfile {
  type: "default" | "clone";
  elevenLabsVoiceId: string; // default voice ID or cloned voice ID from ElevenLabs
  createdAt?: string; // ISO timestamp, set when clone is created
}

export type PageType =
  | "title"
  | "intro"
  | "getting-started"
  | "concept-bullets-image"
  | "concept-description-images"
  | "concept-bullets"
  | "reflection";

interface PageBase {
  id: string;
  order: number;
  pageType: PageType;
  status: "pending" | "approved";
  narrationUrl: string | null;
}

export interface TitlePage extends PageBase {
  pageType: "title";
  title: string;
  subtitle?: string;
}

export interface IntroPage extends PageBase {
  pageType: "intro";
  title: string;
  objective: string; // "I can..." statement
  agenda: string[]; // 1-3 items
  starter: string; // today's starter question
  reminder?: string;
}

export interface GettingStartedPage extends PageBase {
  pageType: "getting-started";
  title: string;
  thingsToDo: string[]; // immediate actions
  bellRinger: string; // bell ringer question
  learningTarget: string; // learning target statement
}

export interface ConceptBulletsImagePage extends PageBase {
  pageType: "concept-bullets-image";
  title: string;
  bullets: string[]; // 2-5 bullet points
  imageDescription: string; // description for image placeholder
  imageUrl?: string; // uploaded image URL
}

export interface ConceptDescriptionImagesPage extends PageBase {
  pageType: "concept-description-images";
  title: string;
  description: string; // explanatory paragraph
  image1Description: string;
  image2Description: string;
  image1Url?: string; // uploaded image URL
  image2Url?: string; // uploaded image URL
}

export interface ConceptBulletsPage extends PageBase {
  pageType: "concept-bullets";
  title: string;
  body: string; // intro sentence
  bullets: string[];
  activity: string;
}

export interface ReflectionPage extends PageBase {
  pageType: "reflection";
  title: string;
  question: string; // open-ended question
  prompt: string; // "explain why..." prompt
}

export type Page =
  | TitlePage
  | IntroPage
  | GettingStartedPage
  | ConceptBulletsImagePage
  | ConceptDescriptionImagesPage
  | ConceptBulletsPage
  | ReflectionPage;

/** Legacy flat page format — kept for backward compatibility */
export interface LegacyPage {
  id: string;
  order: number;
  title: string;
  body: string;
  example: string;
  activity: string;
  status: "pending" | "approved";
  narrationUrl: string | null;
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
