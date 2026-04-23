import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/types";

interface PageListProps {
  pages: Page[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function PageList({ pages, selectedIndex, onSelect }: PageListProps) {
  return (
    <nav className="space-y-1">
      {pages.map((page, index) => (
        <button
          key={page.id}
          onClick={() => onSelect(index)}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
            "flex items-start justify-between gap-2",
            selectedIndex === index
              ? "bg-zinc-900 text-white"
              : "hover:bg-zinc-100 text-zinc-700"
          )}
        >
          <span className="flex-1 min-w-0">
            <span
              className={cn(
                "block text-xs font-medium mb-0.5",
                selectedIndex === index ? "text-zinc-400" : "text-zinc-400"
              )}
            >
              Page {page.order}
            </span>
            <span className="block truncate font-medium">{page.title}</span>
          </span>
          <Badge
            variant={page.status === "approved" ? "default" : "secondary"}
            className={cn(
              "shrink-0 text-xs mt-0.5",
              selectedIndex === index && page.status !== "approved"
                ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-700"
                : ""
            )}
          >
            {page.status === "approved" ? "✓" : "pending"}
          </Badge>
        </button>
      ))}
    </nav>
  );
}
