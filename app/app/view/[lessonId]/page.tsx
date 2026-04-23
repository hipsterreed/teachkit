import { db } from "@/lib/firebase-admin";
import { ViewerClient } from "@/components/viewer/ViewerClient";
import type { Lesson } from "@/lib/types";

interface ViewerPageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { lessonId } = await params;

  let lesson: Lesson | null = null;

  try {
    const doc = await db.doc(`lessons/${lessonId}`).get();
    if (doc.exists) {
      lesson = doc.data() as Lesson;
    }
  } catch {
    // Fall through to not-found state
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-800 mb-2">Lesson not found</h1>
          <p className="text-zinc-500">This link may be invalid or the lesson was removed.</p>
        </div>
      </div>
    );
  }

  if (lesson.status !== "published") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-800 mb-2">
            This lesson isn&apos;t available yet
          </h1>
          <p className="text-zinc-500">
            Your teacher is still preparing this lesson. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  return <ViewerClient lesson={lesson} />;
}
