"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { canPublish } from "@/lib/lesson-logic";
import type { Lesson, Page } from "@/lib/types";

interface PublishBarProps {
  lesson: Lesson;
  onPagesUpdate: (pages: Page[]) => void;
  onPublish: (publishedLesson: Lesson) => void;
}

export function PublishBar({ lesson, onPagesUpdate, onPublish }: PublishBarProps) {
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const pendingCount = lesson.pages.filter((p) => p.status === "pending").length;
  const publishable = canPublish(lesson);

  const handleApproveAll = async () => {
    setIsApprovingAll(true);
    try {
      // Generate narration and approve all pending pages sequentially
      // (sequential to avoid hammering ElevenLabs rate limits)
      const pendingPages = lesson.pages.filter((p) => p.status === "pending");
      const updatedPages = [...lesson.pages];

      for (const p of pendingPages) {
        const res = await fetch(`/api/lessons/${lesson.id}/pages/${p.id}/narration`, {
          method: "POST",
        });
        if (res.ok) {
          const updatedPage = await res.json();
          const idx = updatedPages.findIndex((up) => up.id === p.id);
          if (idx !== -1) updatedPages[idx] = updatedPage;
        }
      }

      onPagesUpdate(updatedPages);
      toast.success("All pages approved with narration");
    } catch {
      toast.error("Failed to approve all pages. Please try again.");
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to publish lesson.");
        return;
      }

      const publishedLesson = await res.json();
      onPublish(publishedLesson);
      toast.success("Lesson published!");
    } catch {
      toast.error("Failed to publish lesson. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (lesson.status === "published") {
    const shareUrl = `${window.location.origin}/view/${lesson.id}`;
    return (
      <div className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-700">✓ Published</p>
            <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{shareUrl}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success("Link copied!");
            }}
          >
            Copy Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-200 bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {pendingCount > 0
            ? `${pendingCount} page${pendingCount === 1 ? "" : "s"} still pending`
            : "All pages approved — ready to publish"}
        </p>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApproveAll}
              disabled={isApprovingAll || isPublishing}
            >
              {isApprovingAll ? "Approving..." : "Approve All"}
            </Button>
          )}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!publishable || isPublishing || isApprovingAll}
          >
            {isPublishing ? "Publishing..." : "Publish Lesson"}
          </Button>
        </div>
      </div>
    </div>
  );
}
