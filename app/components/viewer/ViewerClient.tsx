"use client";

import { useRef, useState } from "react";
import { StudentPage } from "./StudentPage";
import { ViewerNav } from "./ViewerNav";
import { NarrationPlayer, type NarrationPlayerHandle } from "@/components/lesson/NarrationPlayer";
import type { Lesson } from "@/lib/types";

interface ViewerClientProps {
  lesson: Lesson;
}

export function ViewerClient({ lesson }: ViewerClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const narrationRef = useRef<NarrationPlayerHandle>(null);

  const currentPage = lesson.pages[currentIndex];

  const handlePrev = () => {
    narrationRef.current?.stop();
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    narrationRef.current?.stop();
    setCurrentIndex((i) => Math.min(lesson.pages.length - 1, i + 1));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold text-zinc-900">{lesson.title}</h1>
          <p className="text-sm text-zinc-500">{lesson.topic}</p>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Narration player */}
          {currentPage.narrationUrl && (
            <NarrationPlayer ref={narrationRef} src={currentPage.narrationUrl} />
          )}
          <StudentPage page={currentPage} />
        </div>
      </main>

      {/* Navigation */}
      <footer className="border-t border-zinc-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <ViewerNav
            currentIndex={currentIndex}
            total={lesson.pages.length}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </footer>
    </div>
  );
}
