import { v4 as uuidv4 } from "uuid";
import type {
  Page,
  Lesson,
  TitlePage,
  IntroPage,
  GettingStartedPage,
  ConceptBulletsImagePage,
  ConceptDescriptionImagesPage,
  ConceptBulletsPage,
  ReflectionPage,
} from "./types";

export function applyPageContentChange(
  page: Page,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changes: Record<string, any>
): Page {
  return {
    ...page,
    ...changes,
    status: "pending",
    narrationUrl: null,
  } as Page;
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
  switch (page.pageType) {
    case "title": {
      const p = page as TitlePage;
      return p.subtitle ? `${p.title}. ${p.subtitle}` : p.title;
    }
    case "intro": {
      const p = page as IntroPage;
      const agendaText = p.agenda.join(", ");
      const reminderText = p.reminder ? ` Remember: ${p.reminder}` : "";
      return `${p.title}. Objective: ${p.objective}. Today's agenda: ${agendaText}. Starter question: ${p.starter}.${reminderText}`;
    }
    case "getting-started": {
      const p = page as GettingStartedPage;
      const todoText = p.thingsToDo.join(". ");
      return `${p.title}. Things to do: ${todoText}. Bell ringer: ${p.bellRinger}. Learning target: ${p.learningTarget}`;
    }
    case "concept-bullets-image": {
      const p = page as ConceptBulletsImagePage;
      const bulletsText = p.bullets.join(". ");
      return `${p.title}. ${bulletsText}`;
    }
    case "concept-description-images": {
      const p = page as ConceptDescriptionImagesPage;
      return `${p.title}. ${p.description}`;
    }
    case "concept-bullets": {
      const p = page as ConceptBulletsPage;
      const bulletsText = p.bullets.join(". ");
      return `${p.title}. ${p.body} ${bulletsText}. Activity: ${p.activity}`;
    }
    case "reflection": {
      const p = page as ReflectionPage;
      return `${p.title}. ${p.question} ${p.prompt}`;
    }
    default: {
      // Exhaustive fallback
      const p = page as Page;
      return (p as { title?: string }).title ?? "";
    }
  }
}

/** Extract the display title from any page type */
export function getPageTitle(page: Page): string {
  return page.title;
}

// ---------------------------------------------------------------------------
// Raw AI response types
// ---------------------------------------------------------------------------

interface RawTitlePage {
  pageType: "title";
  title: string;
  subtitle?: string;
}

interface RawIntroPage {
  pageType: "intro";
  title: string;
  objective: string;
  agenda: string[];
  starter: string;
  reminder?: string;
}

interface RawGettingStartedPage {
  pageType: "getting-started";
  title: string;
  thingsToDo: string[];
  bellRinger: string;
  learningTarget: string;
}

interface RawConceptBulletsImagePage {
  pageType: "concept-bullets-image";
  title: string;
  bullets: string[];
  imageDescription: string;
}

interface RawConceptDescriptionImagesPage {
  pageType: "concept-description-images";
  title: string;
  description: string;
  image1Description: string;
  image2Description: string;
}

interface RawConceptBulletsPage {
  pageType: "concept-bullets";
  title: string;
  body: string;
  bullets: string[];
  activity: string;
}

interface RawReflectionPage {
  pageType: "reflection";
  title: string;
  question: string;
  prompt: string;
}

type RawPage =
  | RawTitlePage
  | RawIntroPage
  | RawGettingStartedPage
  | RawConceptBulletsImagePage
  | RawConceptDescriptionImagesPage
  | RawConceptBulletsPage
  | RawReflectionPage;

function parseRawPage(rawPage: RawPage, index: number): Page {
  const base = {
    id: uuidv4(),
    order: index + 1,
    status: "pending" as const,
    narrationUrl: null,
  };

  switch (rawPage.pageType) {
    case "title":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (title) missing title`);
      return { ...base, pageType: "title", title: rawPage.title.trim(), subtitle: rawPage.subtitle?.trim() };

    case "intro":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (intro) missing title`);
      if (!rawPage.objective?.trim()) throw new Error(`Page ${index + 1} (intro) missing objective`);
      if (!Array.isArray(rawPage.agenda) || rawPage.agenda.length === 0)
        throw new Error(`Page ${index + 1} (intro) missing agenda`);
      if (!rawPage.starter?.trim()) throw new Error(`Page ${index + 1} (intro) missing starter`);
      return {
        ...base,
        pageType: "intro",
        title: rawPage.title.trim(),
        objective: rawPage.objective.trim(),
        agenda: rawPage.agenda.map((a) => a.trim()),
        starter: rawPage.starter.trim(),
        reminder: rawPage.reminder?.trim(),
      };

    case "getting-started":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (getting-started) missing title`);
      if (!Array.isArray(rawPage.thingsToDo) || rawPage.thingsToDo.length === 0)
        throw new Error(`Page ${index + 1} (getting-started) missing thingsToDo`);
      if (!rawPage.bellRinger?.trim()) throw new Error(`Page ${index + 1} (getting-started) missing bellRinger`);
      if (!rawPage.learningTarget?.trim()) throw new Error(`Page ${index + 1} (getting-started) missing learningTarget`);
      return {
        ...base,
        pageType: "getting-started",
        title: rawPage.title.trim(),
        thingsToDo: rawPage.thingsToDo.map((t) => t.trim()),
        bellRinger: rawPage.bellRinger.trim(),
        learningTarget: rawPage.learningTarget.trim(),
      };

    case "concept-bullets-image":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (concept-bullets-image) missing title`);
      if (!Array.isArray(rawPage.bullets) || rawPage.bullets.length === 0)
        throw new Error(`Page ${index + 1} (concept-bullets-image) missing bullets`);
      if (!rawPage.imageDescription?.trim())
        throw new Error(`Page ${index + 1} (concept-bullets-image) missing imageDescription`);
      return {
        ...base,
        pageType: "concept-bullets-image",
        title: rawPage.title.trim(),
        bullets: rawPage.bullets.map((b) => b.trim()),
        imageDescription: rawPage.imageDescription.trim(),
      };

    case "concept-description-images":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (concept-description-images) missing title`);
      if (!rawPage.description?.trim())
        throw new Error(`Page ${index + 1} (concept-description-images) missing description`);
      if (!rawPage.image1Description?.trim())
        throw new Error(`Page ${index + 1} (concept-description-images) missing image1Description`);
      if (!rawPage.image2Description?.trim())
        throw new Error(`Page ${index + 1} (concept-description-images) missing image2Description`);
      return {
        ...base,
        pageType: "concept-description-images",
        title: rawPage.title.trim(),
        description: rawPage.description.trim(),
        image1Description: rawPage.image1Description.trim(),
        image2Description: rawPage.image2Description.trim(),
      };

    case "concept-bullets":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (concept-bullets) missing title`);
      if (!rawPage.body?.trim()) throw new Error(`Page ${index + 1} (concept-bullets) missing body`);
      if (!Array.isArray(rawPage.bullets) || rawPage.bullets.length === 0)
        throw new Error(`Page ${index + 1} (concept-bullets) missing bullets`);
      if (!rawPage.activity?.trim()) throw new Error(`Page ${index + 1} (concept-bullets) missing activity`);
      return {
        ...base,
        pageType: "concept-bullets",
        title: rawPage.title.trim(),
        body: rawPage.body.trim(),
        bullets: rawPage.bullets.map((b) => b.trim()),
        activity: rawPage.activity.trim(),
      };

    case "reflection":
      if (!rawPage.title?.trim()) throw new Error(`Page ${index + 1} (reflection) missing title`);
      if (!rawPage.question?.trim()) throw new Error(`Page ${index + 1} (reflection) missing question`);
      if (!rawPage.prompt?.trim()) throw new Error(`Page ${index + 1} (reflection) missing prompt`);
      return {
        ...base,
        pageType: "reflection",
        title: rawPage.title.trim(),
        question: rawPage.question.trim(),
        prompt: rawPage.prompt.trim(),
      };

    default: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unknown = rawPage as any;
      throw new Error(`Page ${index + 1} has unknown pageType: ${unknown.pageType}`);
    }
  }
}

export function parseGeneratedPages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: { pages: any[] },
  _lessonId: string
): Page[] {
  if (!raw?.pages || !Array.isArray(raw.pages)) {
    throw new Error("Invalid AI response: missing pages array");
  }

  const count = raw.pages.length;
  if (count < 6 || count > 10) {
    throw new Error(`Invalid AI response: expected 6–10 pages, got ${count}`);
  }

  return raw.pages.map((rawPage, index) => {
    if (!rawPage.pageType) throw new Error(`Page ${index + 1} missing pageType`);
    return parseRawPage(rawPage as RawPage, index);
  });
}
