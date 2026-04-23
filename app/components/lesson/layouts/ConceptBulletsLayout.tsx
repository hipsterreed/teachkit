import type { ConceptBulletsPage } from "@/lib/types";

interface ConceptBulletsLayoutProps {
  page: ConceptBulletsPage;
}

export function ConceptBulletsLayout({ page }: ConceptBulletsLayoutProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-zinc-900">{page.title}</h2>
      <p className="text-sm leading-relaxed text-zinc-600">{page.body}</p>

      <ul className="space-y-2">
        {page.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <p className="text-sm leading-relaxed text-zinc-700">{bullet}</p>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-amber-50 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-600">Activity</p>
        <p className="text-sm leading-relaxed text-zinc-700">{page.activity}</p>
      </div>
    </div>
  );
}
