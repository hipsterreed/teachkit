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

const TEACHING_TONES = ["Fun", "Structured", "Simple", "Engaging"] as const;

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
  const [gradeLevel, setGradeLevel] = useState(initialValues?.gradeLevel ?? "");
  const [subject, setSubject] = useState(initialValues?.subject ?? "");
  const [teachingTone, setTeachingTone] = useState<TeacherProfile["teachingTone"] | "">(
    initialValues?.teachingTone ?? ""
  );
  const [errors, setErrors] = useState<Partial<Record<keyof TeacherProfile, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TeacherProfile, string>> = {};
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
        gradeLevel,
        subject: subject.trim(),
        teachingTone: teachingTone as TeacherProfile["teachingTone"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Grade Level</Label>
        <Select value={gradeLevel} onValueChange={setGradeLevel}>
          <SelectTrigger id="gradeLevel" className={errors.gradeLevel ? "border-red-500" : ""}>
            <SelectValue placeholder="Select a grade level" />
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
          <p className="text-sm text-red-500">{errors.gradeLevel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject / Class</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Biology, 5th Grade Math, World History"
          className={errors.subject ? "border-red-500" : ""}
        />
        {errors.subject && (
          <p className="text-sm text-red-500">{errors.subject}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="teachingTone">Teaching Tone</Label>
        <Select
          value={teachingTone}
          onValueChange={(v) => setTeachingTone(v as TeacherProfile["teachingTone"])}
        >
          <SelectTrigger
            id="teachingTone"
            className={errors.teachingTone ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select a tone" />
          </SelectTrigger>
          <SelectContent>
            {TEACHING_TONES.map((tone) => (
              <SelectItem key={tone} value={tone}>
                {tone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.teachingTone && (
          <p className="text-sm text-red-500">{errors.teachingTone}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
