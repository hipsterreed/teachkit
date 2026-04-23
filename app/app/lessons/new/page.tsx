"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BriefForm } from "@/components/lesson/BriefForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LessonBrief } from "@/lib/types";
import { useState } from "react";

export default function NewLessonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (brief: LessonBrief) => {
    setLoading(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to generate lesson. Please try again.");
        return;
      }

      const lesson = await res.json();
      toast.success("Lesson generated!");
      router.push(`/lessons/${lesson.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">← Back</Link>
          </Button>
          <h1 className="text-lg font-semibold text-zinc-900">New Lesson</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a Lesson</CardTitle>
            <CardDescription>
              Describe your lesson and the AI will generate 5–8 structured pages tailored to your
              students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BriefForm onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
