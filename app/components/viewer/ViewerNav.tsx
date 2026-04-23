import { Button } from "@/components/ui/button";

interface ViewerNavProps {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ViewerNav({ currentIndex, total, onPrev, onNext }: ViewerNavProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentIndex === 0}
      >
        ← Previous
      </Button>

      <span className="text-sm text-zinc-500 font-medium">
        Page {currentIndex + 1} of {total}
      </span>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentIndex === total - 1}
      >
        Next →
      </Button>
    </div>
  );
}
