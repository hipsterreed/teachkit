import { ImageUploadPlaceholder } from "@/components/lesson/ImageUploadPlaceholder";
import type { ConceptDescriptionImagesPage } from "@/lib/types";

interface ConceptDescriptionImagesLayoutProps {
  page: ConceptDescriptionImagesPage;
  lessonId?: string;
  sessionId?: string;
  readOnly?: boolean;
  onPageUpdate?: (updates: Partial<ConceptDescriptionImagesPage>) => void;
}

export function ConceptDescriptionImagesLayout({
  page,
  lessonId = "",
  sessionId = "",
  readOnly = false,
  onPageUpdate,
}: ConceptDescriptionImagesLayoutProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-zinc-900">{page.title}</h2>
      <p className="text-sm leading-relaxed text-zinc-700">{page.description}</p>
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadPlaceholder
          description={page.image1Description}
          imageUrl={page.image1Url}
          lessonId={lessonId}
          pageId={page.id}
          sessionId={sessionId}
          slot="image1"
          readOnly={readOnly}
          minHeight="min-h-[180px]"
          onUpload={(image1Url) => onPageUpdate?.({ image1Url })}
        />
        <ImageUploadPlaceholder
          description={page.image2Description}
          imageUrl={page.image2Url}
          lessonId={lessonId}
          pageId={page.id}
          sessionId={sessionId}
          slot="image2"
          readOnly={readOnly}
          minHeight="min-h-[180px]"
          onUpload={(image2Url) => onPageUpdate?.({ image2Url })}
        />
      </div>
    </div>
  );
}
