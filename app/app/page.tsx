"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lesson, TeacherProfile } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/teacher");
      const data = await res.json();

      if (!data.profile) {
        router.push("/setup");
        return;
      }

      setProfile(data.profile);

      const lessonsRes = await fetch("/api/lessons");
      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData.lessons ?? []);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">AI Lesson Planner</h1>
            {profile && (
              <p className="text-sm text-zinc-500">
                {profile.gradeLevel} · {profile.subject} · {profile.teachingTone}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/setup">Edit Profile</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/lessons/new">+ New Lesson</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {lessons.length === 0 ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold text-zinc-800 mb-2">No lessons yet</h2>
            <p className="text-zinc-500 mb-6">
              Create your first AI-generated lesson in just a few minutes.
            </p>
            <Button asChild>
              <Link href="/lessons/new">Create Your First Lesson</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">Your Lessons</h2>
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{lesson.title}</CardTitle>
                    <Badge variant={lesson.status === "published" ? "default" : "secondary"}>
                      {lesson.status}
                    </Badge>
                  </div>
                  <CardDescription>{lesson.topic}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500">
                      {lesson.pages.length} pages ·{" "}
                      {lesson.pages.filter((p) => p.status === "approved").length} approved
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/lessons/${lesson.id}`}>
                        {lesson.status === "published" ? "View" : "Review"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
