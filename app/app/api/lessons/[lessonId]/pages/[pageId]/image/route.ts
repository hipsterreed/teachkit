import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase-admin";
import type { Lesson } from "@/lib/types";

type Params = Promise<{ lessonId: string; pageId: string }>;

function getLessonDoc(sessionId: string, lessonId: string) {
  return db.doc(`teachers/${sessionId}/lessons/${lessonId}`);
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { lessonId, pageId } = await params;
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 });
    }

    // Get the image slot from query param (e.g. ?slot=image1 or ?slot=image)
    const url = new URL(request.url);
    const slot = url.searchParams.get("slot") ?? "image";

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Upload to Firebase Storage
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const storagePath = `images/${sessionId}/${lessonId}/${pageId}/${slot}.${ext}`;
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await file.save(buffer, { metadata: { contentType: imageFile.type } });
    await file.makePublic();

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Update the page in Firestore — set the image URL on the correct slot
    const doc = await getLessonDoc(sessionId, lessonId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lesson = doc.data() as Lesson;
    const pageIndex = lesson.pages.findIndex((p) => p.id === pageId);
    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const updatedPages = [...lesson.pages];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPage = { ...updatedPages[pageIndex] } as any;

    // Map slot name to the correct field
    if (slot === "image1") updatedPage.image1Url = imageUrl;
    else if (slot === "image2") updatedPage.image2Url = imageUrl;
    else updatedPage.imageUrl = imageUrl;

    updatedPages[pageIndex] = updatedPage;
    await getLessonDoc(sessionId, lessonId).update({ pages: updatedPages });

    return NextResponse.json({ imageUrl, slot });
  } catch (error) {
    console.error("POST image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
