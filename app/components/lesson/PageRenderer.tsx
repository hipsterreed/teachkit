import type { Page, ConceptBulletsImagePage, ConceptDescriptionImagesPage } from "@/lib/types";
import { TitlePageLayout } from "./layouts/TitlePageLayout";
import { IntroPageLayout } from "./layouts/IntroPageLayout";
import { GettingStartedPageLayout } from "./layouts/GettingStartedPageLayout";
import { ConceptBulletsImageLayout } from "./layouts/ConceptBulletsImageLayout";
import { ConceptDescriptionImagesLayout } from "./layouts/ConceptDescriptionImagesLayout";
import { ConceptBulletsLayout } from "./layouts/ConceptBulletsLayout";
import { ReflectionPageLayout } from "./layouts/ReflectionPageLayout";

interface PageRendererProps {
  page: Page;
  lessonId?: string;
  sessionId?: string;
  readOnly?: boolean;
  onPageUpdate?: (updates: Partial<Page>) => void;
}

export function PageRenderer({
  page,
  lessonId,
  sessionId,
  readOnly = false,
  onPageUpdate,
}: PageRendererProps) {
  switch (page.pageType) {
    case "title":
      return <TitlePageLayout page={page} />;
    case "intro":
      return <IntroPageLayout page={page} />;
    case "getting-started":
      return <GettingStartedPageLayout page={page} />;
    case "concept-bullets-image":
      return (
        <ConceptBulletsImageLayout
          page={page}
          lessonId={lessonId}
          sessionId={sessionId}
          readOnly={readOnly}
          onPageUpdate={onPageUpdate as (updates: Partial<ConceptBulletsImagePage>) => void}
        />
      );
    case "concept-description-images":
      return (
        <ConceptDescriptionImagesLayout
          page={page}
          lessonId={lessonId}
          sessionId={sessionId}
          readOnly={readOnly}
          onPageUpdate={onPageUpdate as (updates: Partial<ConceptDescriptionImagesPage>) => void}
        />
      );
    case "concept-bullets":
      return <ConceptBulletsLayout page={page} />;
    case "reflection":
      return <ReflectionPageLayout page={page} />;
    default: {
      const _exhaustive: never = page;
      return (
        <div className="rounded-xl border border-zinc-200 p-6 text-sm text-zinc-400">
          Unknown page type
        </div>
      );
    }
  }
}
