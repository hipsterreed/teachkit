"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageList } from "@/components/lesson/PageList";
import { PageCard } from "@/components/lesson/PageCard";
import { PublishBar } from "@/components/lesson/PublishBar";
import { useSession } from "@/lib/use-session";
import type { Lesson, Page } from "@/lib/types";

function LessonReviewContent() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const sessionId = useSession();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`, {
          headers: { "x-session-id": sessionId },
        });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setLesson(data);
      } catch {
        toast.error("Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, sessionId]);

  const handlePageUpdate = (updatedPage: Page) => {
    if (!lesson) return;
    setLesson({ ...lesson, pages: lesson.pages.map((p) => p.id === updatedPage.id ? updatedPage : p) });
  };

  const handlePagesUpdate = (pages: Page[]) => {
    if (!lesson) return;
    setLesson({ ...lesson, pages });
  };

  const handlePublish = (publishedLesson: Lesson) => {
    setLesson(publishedLesson);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-700 mb-4">Lesson not found.</p>
          <Button asChild variant="outline">
            <Link href={sessionId ? `/?session=${sessionId}` : "/"}>Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentPage = lesson.pages[selectedIndex];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={sessionId ? `/?session=${sessionId}` : "/"}>← Back</Link>
            </Button>
            <div>
              <h1 className="text-base font-semibold text-zinc-900">{lesson.title}</h1>
              <p className="text-xs text-zinc-500">{lesson.topic}</p>
            </div>
          </div>
          {lesson.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/view/${lesson.id}`} target="_blank">Preview as Student ↗</Link>
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-6xl w-full mx-auto">
        <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white overflow-y-auto p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Pages</p>
          <PageList pages={lesson.pages} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {currentPage && (
            <PageCard
              key={currentPage.id}
              page={currentPage}
              lessonId={lesson.id}
              sessionId={sessionId ?? ""}
              onPageUpdate={handlePageUpdate}
            />
          )}
        </main>
      </div>

      <div className="shrink-0">
        <PublishBar
          lesson={lesson}
          sessionId={sessionId ?? ""}
          onPagesUpdate={handlePagesUpdate}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}

export default function LessonReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50"><p className="text-zinc-500">Loading...</p></div>}>
      <LessonReviewContent />
    </Suspense>
  );
}
