import { ImageUploadPlaceholder } from "@/components/lesson/ImageUploadPlaceholder";
import type { ConceptBulletsImagePage } from "@/lib/types";

interface ConceptBulletsImageLayoutProps {
  page: ConceptBulletsImagePage;
  lessonId?: string;
  sessionId?: string;
  readOnly?: boolean;
  onPageUpdate?: (updates: Partial<ConceptBulletsImagePage>) => void;
}

export function ConceptBulletsImageLayout({
  page,
  lessonId = "",
  sessionId = "",
  readOnly = false,
  onPageUpdate,
}: ConceptBulletsImageLayoutProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">{page.title}</h2>
      <div className="flex gap-6">
        {/* Left: bullets (60%) */}
        <div className="flex-[3] space-y-3">
          {page.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <p className="text-sm leading-relaxed text-zinc-700">{bullet}</p>
            </div>
          ))}
        </div>

        {/* Right: image (40%) */}
        <div className="flex-[2]">
          <ImageUploadPlaceholder
            description={page.imageDescription}
            imageUrl={page.imageUrl}
            lessonId={lessonId}
            pageId={page.id}
            sessionId={sessionId}
            slot="image"
            readOnly={readOnly}
            minHeight="min-h-[220px]"
            onUpload={(imageUrl) => onPageUpdate?.({ imageUrl })}
          />
        </div>
      </div>
    </div>
  );
}
