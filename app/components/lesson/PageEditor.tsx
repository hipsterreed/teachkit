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
  onSave: (updatedPage: Page) => void;
  onCancel: () => void;
}

export function PageEditor({ page, lessonId, onSave, onCancel }: PageEditorProps) {
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.body);
  const [example, setExample] = useState(page.example);
  const [activity, setActivity] = useState(page.activity);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, example, activity }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updatedPage = await res.json();
      onSave(updatedPage);
    } catch {
      // Error handled by parent via toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Page Title</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-body">Content</Label>
        <Textarea
          id="edit-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-example">Example</Label>
        <Textarea
          id="edit-example"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          rows={3}
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-activity">Activity / Question</Label>
        <Textarea
          id="edit-activity"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          rows={3}
          disabled={saving}
        />
      </div>

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
