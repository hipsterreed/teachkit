import type { TeacherProfile, LessonBrief } from "./types";

export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
}

const isBlank = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0 || value.every((v) => isBlank(v));
  return false;
};

export function validateTeacherProfile(
  profile: Partial<TeacherProfile> | null | undefined
): ValidationResult {
  const missingFields: string[] = [];

  if (!profile || isBlank(profile.gradeLevel)) missingFields.push("gradeLevel");
  if (!profile || isBlank(profile.subject)) missingFields.push("subject");
  if (!profile || isBlank(profile.teachingTone)) missingFields.push("teachingTone");

  return { valid: missingFields.length === 0, missingFields };
}

export function validateLessonBrief(
  brief: Partial<LessonBrief> | null | undefined
): ValidationResult {
  const missingFields: string[] = [];

  if (!brief || isBlank(brief.title)) missingFields.push("title");
  if (!brief || isBlank(brief.topic)) missingFields.push("topic");
  if (!brief || isBlank(brief.objectives)) missingFields.push("objectives");

  return { valid: missingFields.length === 0, missingFields };
}
