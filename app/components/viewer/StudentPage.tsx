import { PageRenderer } from "@/components/lesson/PageRenderer";
import type { Page } from "@/lib/types";

interface StudentPageProps {
  page: Page;
}

export function StudentPage({ page }: StudentPageProps) {
  return (
    <article className="space-y-4">
      <header>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
          Page {page.order}
        </p>
      </header>
      <PageRenderer page={page} readOnly={true} />
    </article>
  );
}
