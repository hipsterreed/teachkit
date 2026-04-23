"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeacherProfile } from "@/lib/types";

const GRADE_LEVELS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const TEACHING_TONES: { value: TeacherProfile["teachingTone"]; description: string }[] = [
  { value: "Fun", description: "Playful, energetic, and engaging" },
  { value: "Structured", description: "Clear, methodical, and organized" },
  { value: "Simple", description: "Plain language, easy to follow" },
  { value: "Engaging", description: "Conversational and thought-provoking" },
];

interface ProfileFormProps {
  initialValues?: Partial<TeacherProfile>;
  onSubmit: (profile: TeacherProfile) => Promise<void>;
  submitLabel?: string;
}

export function ProfileForm({
  initialValues,
  onSubmit,
  submitLabel = "Save Profile",
}: ProfileFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [gradeLevel, setGradeLevel] = useState(initialValues?.gradeLevel ?? "");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [teachingTone, setTeachingTone] = useState<TeacherProfile["teachingTone"] | "">(
    initialValues?.teachingTone ?? ""
  );
  const [errors, setErrors] = useState<Partial<Record<keyof TeacherProfile, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TeacherProfile, string>> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!gradeLevel) newErrors.gradeLevel = "Grade level is required";
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!teachingTone) newErrors.teachingTone = "Teaching tone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        gradeLevel,
        subject: subject.trim(),
        teachingTone: teachingTone as TeacherProfile["teachingTone"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Your name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ms. Johnson"
          className={errors.name ? "border-red-400 focus:ring-red-400" : ""}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>
      {/* Grade level */}
      <div className="space-y-1.5">
        <Label htmlFor="gradeLevel" className="text-sm font-medium text-zinc-700">
          Grade level
        </Label>
        <Select value={gradeLevel} onValueChange={setGradeLevel}>
          <SelectTrigger
            id="gradeLevel"
            className={errors.gradeLevel ? "border-red-400 focus:ring-red-400" : ""}
          >
            <SelectValue placeholder="Select a grade" />
          </SelectTrigger>
          <SelectContent>
            {GRADE_LEVELS.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.gradeLevel && (
          <p className="text-xs text-red-500">{errors.gradeLevel}</p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <Label htmlFor="subject" className="text-sm font-medium text-zinc-700">
          Subject or class
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Biology, 5th Grade Math, World History"
          className={errors.subject ? "border-red-400 focus:ring-red-400" : ""}
        />
        {errors.subject && (
          <p className="text-xs text-red-500">{errors.subject}</p>
        )}
      </div>

      {/* Teaching tone */}
      <div className="space-y-1.5">
        <Label htmlFor="teachingTone" className="text-sm font-medium text-zinc-700">
          Teaching tone
        </Label>
        <Select
          value={teachingTone}
          onValueChange={(v) => setTeachingTone(v as TeacherProfile["teachingTone"])}
        >
          <SelectTrigger
            id="teachingTone"
            className={errors.teachingTone ? "border-red-400 focus:ring-red-400" : ""}
          >
            <SelectValue placeholder="Choose a tone" />
          </SelectTrigger>
          <SelectContent>
            {TEACHING_TONES.map(({ value, description }) => (
              <SelectItem key={value} value={value}>
                <div className="flex flex-col">
                  <span className="font-medium">{value}</span>
                  <span className="text-muted-foreground text-xs">{description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.teachingTone && (
          <p className="text-xs text-red-500">{errors.teachingTone}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-2">
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
