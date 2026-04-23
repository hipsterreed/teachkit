import type { IntroPage } from "@/lib/types";

interface IntroPageLayoutProps {
  page: IntroPage;
}

interface CardProps {
  label: string;
  icon: string;
  children: React.ReactNode;
}

function InfoCard({ label, icon, children }: CardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm min-h-[160px]">
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </span>
      </div>
      <div className="flex-1 p-4 text-sm text-zinc-700">{children}</div>
    </div>
  );
}

export function IntroPageLayout({ page }: IntroPageLayoutProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">{page.title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Objective" icon="🎯">
          <p className="leading-relaxed">{page.objective}</p>
        </InfoCard>

        <InfoCard label="Today's Agenda" icon="📋">
          <ul className="space-y-2">
            {page.agenda.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard label="Today's Starter" icon="💬">
          <p className="leading-relaxed">{page.starter}</p>
        </InfoCard>

        <InfoCard label="Remember" icon="📌">
          {page.reminder ? (
            <p className="leading-relaxed">{page.reminder}</p>
          ) : (
            <p className="italic text-zinc-400">No reminder for today.</p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}
