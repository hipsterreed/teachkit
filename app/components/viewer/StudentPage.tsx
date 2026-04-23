import type { Page } from "@/lib/types";

interface StudentPageProps {
  page: Page;
}

export function StudentPage({ page }: StudentPageProps) {
  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
          Page {page.order}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">{page.title}</h1>
      </header>

      <section>
        <p className="text-zinc-700 text-lg leading-relaxed whitespace-pre-wrap">{page.body}</p>
      </section>

      <section className="bg-blue-50 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
          Example
        </h2>
        <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{page.example}</p>
      </section>

      <section className="bg-amber-50 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
          Try It
        </h2>
        <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{page.activity}</p>
      </section>
    </article>
  );
}
