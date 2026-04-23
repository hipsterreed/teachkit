import type { TitlePage } from "@/lib/types";

interface TitlePageLayoutProps {
  page: TitlePage;
}

export function TitlePageLayout({ page }: TitlePageLayoutProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-linear-to-br from-primary/5 to-background px-12 py-16 text-center">
      <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-900">
        {page.title}
      </h1>
      {page.subtitle && (
        <p className="mt-5 text-xl text-zinc-400">{page.subtitle}</p>
      )}
    </div>
  );
}
