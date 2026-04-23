"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Page } from "@/lib/types";

interface PageEditorProps {
  page: Page;
  lessonId: string;
  sessionId: string;
  onSave: (updatedPage: Page) => void;
  onCancel: () => void;
}

/** Convert an array to a newline-separated string for textarea editing */
function arrayToText(arr: string[]): string {
  return arr.join("\n");
}

/** Convert a newline-separated textarea value back to an array */
function textToArray(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function PageEditor({ page, lessonId, sessionId, onSave, onCancel }: PageEditorProps) {
  const [saving, setSaving] = useState(false);

  // Build initial field state based on pageType
  const [fields, setFields] = useState<Record<string, string | undefined>>(() => {
    switch (page.pageType) {
      case "title":
        return { title: page.title, subtitle: page.subtitle ?? "" };
      case "intro":
        return {
          title: page.title,
          objective: page.objective,
          agenda: arrayToText(page.agenda),
          starter: page.starter,
          reminder: page.reminder ?? "",
        };
      case "getting-started":
        return {
          title: page.title,
          thingsToDo: arrayToText(page.thingsToDo),
          bellRinger: page.bellRinger,
          learningTarget: page.learningTarget,
        };
      case "concept-bullets-image":
        return {
          title: page.title,
          bullets: arrayToText(page.bullets),
          imageDescription: page.imageDescription,
        };
      case "concept-description-images":
        return {
          title: page.title,
          description: page.description,
          image1Description: page.image1Description,
          image2Description: page.image2Description,
        };
      case "concept-bullets":
        return {
          title: page.title,
          body: page.body,
          bullets: arrayToText(page.bullets),
          activity: page.activity,
        };
      case "reflection":
        return {
          title: page.title,
          question: page.question,
          prompt: page.prompt,
        };
      default:
        return {};
    }
  });

  const set = (key: string, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const buildPayload = (): Record<string, unknown> => {
    switch (page.pageType) {
      case "title":
        return { title: fields.title, subtitle: fields.subtitle || undefined };
      case "intro":
        return {
          title: fields.title,
          objective: fields.objective,
          agenda: textToArray(fields.agenda),
          starter: fields.starter,
          reminder: fields.reminder || undefined,
        };
      case "getting-started":
        return {
          title: fields.title,
          thingsToDo: textToArray(fields.thingsToDo),
          bellRinger: fields.bellRinger,
          learningTarget: fields.learningTarget,
        };
      case "concept-bullets-image":
        return {
          title: fields.title,
          bullets: textToArray(fields.bullets),
          imageDescription: fields.imageDescription,
        };
      case "concept-description-images":
        return {
          title: fields.title,
          description: fields.description,
          image1Description: fields.image1Description,
          image2Description: fields.image2Description,
        };
      case "concept-bullets":
        return {
          title: fields.title,
          body: fields.body,
          bullets: textToArray(fields.bullets),
          activity: fields.activity,
        };
      case "reflection":
        return {
          title: fields.title,
          question: fields.question,
          prompt: fields.prompt,
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/pages/${page.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updatedPage = await res.json();
      onSave(updatedPage);
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title — present on all page types */}
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={fields.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          disabled={saving}
        />
      </div>

      {/* Type-specific fields */}
      {page.pageType === "title" && (
        <div className="space-y-2">
          <Label htmlFor="edit-subtitle">Subtitle (optional)</Label>
          <Input
            id="edit-subtitle"
            value={fields.subtitle ?? ""}
            onChange={(e) => set("subtitle", e.target.value)}
            disabled={saving}
          />
        </div>
      )}

      {page.pageType === "intro" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-objective">Objective (I can...)</Label>
            <Input
              id="edit-objective"
              value={fields.objective ?? ""}
              onChange={(e) => set("objective", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-agenda">Agenda (one item per line)</Label>
            <Textarea
              id="edit-agenda"
              value={fields.agenda ?? ""}
              onChange={(e) => set("agenda", e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-starter">Starter Question</Label>
            <Textarea
              id="edit-starter"
              value={fields.starter ?? ""}
              onChange={(e) => set("starter", e.target.value)}
              rows={2}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-reminder">Reminder (optional)</Label>
            <Input
              id="edit-reminder"
              value={fields.reminder ?? ""}
              onChange={(e) => set("reminder", e.target.value)}
              disabled={saving}
            />
          </div>
        </>
      )}

      {page.pageType === "getting-started" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-thingsToDo">Things To Do (one per line)</Label>
            <Textarea
              id="edit-thingsToDo"
              value={fields.thingsToDo ?? ""}
              onChange={(e) => set("thingsToDo", e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bellRinger">Bell Ringer</Label>
            <Textarea
              id="edit-bellRinger"
              value={fields.bellRinger ?? ""}
              onChange={(e) => set("bellRinger", e.target.value)}
              rows={2}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-learningTarget">Learning Target</Label>
            <Textarea
              id="edit-learningTarget"
              value={fields.learningTarget ?? ""}
              onChange={(e) => set("learningTarget", e.target.value)}
              rows={2}
              disabled={saving}
            />
          </div>
        </>
      )}

      {page.pageType === "concept-bullets-image" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-bullets">Bullets (one per line)</Label>
            <Textarea
              id="edit-bullets"
              value={fields.bullets ?? ""}
              onChange={(e) => set("bullets", e.target.value)}
              rows={5}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-imageDescription">Image Description</Label>
            <Input
              id="edit-imageDescription"
              value={fields.imageDescription ?? ""}
              onChange={(e) => set("imageDescription", e.target.value)}
              disabled={saving}
            />
          </div>
        </>
      )}

      {page.pageType === "concept-description-images" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={fields.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-image1Description">Image 1 Description</Label>
            <Input
              id="edit-image1Description"
              value={fields.image1Description ?? ""}
              onChange={(e) => set("image1Description", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-image2Description">Image 2 Description</Label>
            <Input
              id="edit-image2Description"
              value={fields.image2Description ?? ""}
              onChange={(e) => set("image2Description", e.target.value)}
              disabled={saving}
            />
          </div>
        </>
      )}

      {page.pageType === "concept-bullets" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-body">Intro Sentence</Label>
            <Textarea
              id="edit-body"
              value={fields.body ?? ""}
              onChange={(e) => set("body", e.target.value)}
              rows={2}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bullets">Bullets (one per line)</Label>
            <Textarea
              id="edit-bullets"
              value={fields.bullets ?? ""}
              onChange={(e) => set("bullets", e.target.value)}
              rows={5}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-activity">Activity</Label>
            <Textarea
              id="edit-activity"
              value={fields.activity ?? ""}
              onChange={(e) => set("activity", e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>
        </>
      )}

      {page.pageType === "reflection" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="edit-question">Question</Label>
            <Textarea
              id="edit-question"
              value={fields.question ?? ""}
              onChange={(e) => set("question", e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-prompt">Prompt</Label>
            <Textarea
              id="edit-prompt"
              value={fields.prompt ?? ""}
              onChange={(e) => set("prompt", e.target.value)}
              rows={3}
              disabled={saving}
            />
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
