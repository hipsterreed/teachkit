"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageEditor } from "./PageEditor";
import { NarrationPlayer } from "./NarrationPlayer";
import { PageRenderer } from "./PageRenderer";
import type { Page } from "@/lib/types";

interface PageCardProps {
  page: Page;
  lessonId: string;
  sessionId: string;
  onPageUpdate: (updatedPage: Page) => void;
}

export function PageCard({ page, lessonId, sessionId, onPageUpdate }: PageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const headers = { "x-session-id": sessionId };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/pages/${page.id}/narration`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to generate narration. Please try again.", {
          action: { label: "Retry", onClick: handleApprove },
        });
        return;
      }

      const updatedPage = await res.json();
      onPageUpdate(updatedPage);
      toast.success("Page approved with narration");
    } catch {
      toast.error("Failed to approve page. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRegenerate = async () => {
    const previous = page;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/pages/${page.id}/regenerate`, {
        method: "POST",
        headers,
      });

      if (!res.ok) throw new Error("Failed to regenerate");

      const updatedPage = await res.json();
      onPageUpdate(updatedPage);
      toast.success("Page regenerated");
    } catch {
      onPageUpdate(previous);
      toast.error("Failed to regenerate page. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEdit = (updatedPage: Page) => {
    onPageUpdate(updatedPage);
    setIsEditing(false);
    toast.success("Changes saved");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          Page {page.order}
        </p>
        <Badge variant={page.status === "approved" ? "default" : "secondary"} className="shrink-0">
          {page.status === "approved" ? "✓ Approved" : "Pending"}
        </Badge>
      </div>

      {isEditing ? (
        <PageEditor
          page={page}
          lessonId={lessonId}
          sessionId={sessionId}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {page.narrationUrl && <NarrationPlayer src={page.narrationUrl} />}

          <PageRenderer
            page={page}
            lessonId={lessonId}
            sessionId={sessionId}
            readOnly={false}
            onPageUpdate={(updates) => onPageUpdate({ ...page, ...updates } as typeof page)}
          />

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            {page.status === "pending" && (
              <Button onClick={handleApprove} disabled={isApproving || isRegenerating} className="flex-1">
                {isApproving ? "Generating narration..." : "✓ Approve"}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isApproving || isRegenerating}>
              Edit
            </Button>
            <Button variant="outline" onClick={handleRegenerate} disabled={isRegenerating || isApproving}>
              {isRegenerating ? "Regenerating..." : "↺ Regenerate"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
