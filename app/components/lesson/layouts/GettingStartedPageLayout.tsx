import type { GettingStartedPage } from "@/lib/types";

interface GettingStartedPageLayoutProps {
  page: GettingStartedPage;
}

interface PillarProps {
  label: string;
  accentClass: string;
  children: React.ReactNode;
}

function Pillar({ label, accentClass, children }: PillarProps) {
  return (
    <div
      className={`flex flex-1 flex-col rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden border-t-4 ${accentClass}`}
    >
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      </div>
      <div className="flex-1 px-4 pb-5 text-sm text-zinc-700">{children}</div>
    </div>
  );
}

export function GettingStartedPageLayout({ page }: GettingStartedPageLayoutProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900">{page.title}</h2>
      <div className="flex gap-4 min-h-[280px]">
        <Pillar label="Things To Do" accentClass="border-t-blue-500">
          <ul className="space-y-2 mt-1">
            {page.thingsToDo.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Pillar>

        <Pillar label="Bell Ringer" accentClass="border-t-emerald-500">
          <p className="mt-1 leading-relaxed">{page.bellRinger}</p>
        </Pillar>

        <Pillar label="Learning Target" accentClass="border-t-violet-500">
          <p className="mt-1 leading-relaxed">{page.learningTarget}</p>
        </Pillar>
      </div>
    </div>
  );
}
