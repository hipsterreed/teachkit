import type { ReflectionPage } from "@/lib/types";

interface ReflectionPageLayoutProps {
  page: ReflectionPage;
}

export function ReflectionPageLayout({ page }: ReflectionPageLayoutProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center space-y-8 rounded-2xl bg-linear-to-br from-violet-50 to-blue-50 px-12 py-16 text-center">
      <h2 className="text-3xl font-bold text-zinc-900">{page.title}</h2>
      <p className="max-w-2xl text-2xl font-medium leading-relaxed text-zinc-700">
        {page.question}
      </p>
      <div className="max-w-xl rounded-xl bg-white/80 px-6 py-4 shadow-sm">
        <p className="text-sm italic text-zinc-600">{page.prompt}</p>
      </div>
    </div>
  );
}
