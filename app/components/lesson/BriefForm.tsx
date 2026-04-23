"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateLessonBrief } from "@/lib/validation";
import type { LessonBrief } from "@/lib/types";

interface BriefFormProps {
  onSubmit: (brief: LessonBrief) => Promise<void>;
  loading?: boolean;
}

export function BriefForm({ onSubmit, loading = false }: BriefFormProps) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const objectives = objectivesText
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);

    const result = validateLessonBrief({ title, topic, objectives });
    const newErrors: Partial<Record<string, string>> = {};

    result.missingFields.forEach((field) => {
      if (field === "title") newErrors.title = "Lesson title is required";
      if (field === "topic") newErrors.topic = "Topic is required";
      if (field === "objectives") newErrors.objectives = "At least one learning objective is required";
    });

    setErrors(newErrors);
    return result.valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const objectives = objectivesText
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);

    await onSubmit({
      title: title.trim(),
      topic: topic.trim(),
      objectives,
      inclusions: inclusions.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Lesson Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Photosynthesis"
          className={errors.title ? "border-red-500" : ""}
          disabled={loading}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. How plants convert sunlight into energy"
          className={errors.topic ? "border-red-500" : ""}
          disabled={loading}
        />
        {errors.topic && <p className="text-sm text-red-500">{errors.topic}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="objectives">
          Learning Objectives{" "}
          <span className="text-zinc-400 font-normal">(one per line)</span>
        </Label>
        <Textarea
          id="objectives"
          value={objectivesText}
          onChange={(e) => setObjectivesText(e.target.value)}
          placeholder={"Understand what chlorophyll does\nExplain the light and dark reactions\nIdentify the inputs and outputs of photosynthesis"}
          rows={4}
          className={errors.objectives ? "border-red-500" : ""}
          disabled={loading}
        />
        {errors.objectives && (
          <p className="text-sm text-red-500">{errors.objectives}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="inclusions">
          Specific Inclusions{" "}
          <span className="text-zinc-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="inclusions"
          value={inclusions}
          onChange={(e) => setInclusions(e.target.value)}
          placeholder="e.g. Include a real-world analogy, mention the role of water"
          rows={3}
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Generating lesson..." : "Generate Lesson"}
      </Button>
    </form>
  );
}
