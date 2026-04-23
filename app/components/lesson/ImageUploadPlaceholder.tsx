"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadPlaceholderProps {
  description: string;
  imageUrl?: string;
  lessonId: string;
  pageId: string;
  sessionId: string;
  slot?: string; // "image" | "image1" | "image2"
  onUpload?: (imageUrl: string) => void;
  minHeight?: string;
  readOnly?: boolean;
}

export function ImageUploadPlaceholder({
  description,
  imageUrl,
  lessonId,
  pageId,
  sessionId,
  slot = "image",
  onUpload,
  minHeight = "min-h-[200px]",
  readOnly = false,
}: ImageUploadPlaceholderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | undefined>(imageUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `/api/lessons/${lessonId}/pages/${pageId}/image?slot=${slot}`,
        {
          method: "POST",
          headers: { "x-session-id": sessionId },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setLocalUrl(data.imageUrl);
      onUpload?.(data.imageUrl);
    } catch {
      // silently fail — placeholder stays
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (localUrl) {
    return (
      <div className={`relative ${minHeight} overflow-hidden rounded-xl`}>
        <Image
          src={localUrl}
          alt={description}
          fill
          className="object-cover"
        />
        {!readOnly && (
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
          >
            Replace
          </button>
        )}
        {!readOnly && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex ${minHeight} flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition-colors ${!readOnly ? "cursor-pointer hover:border-zinc-300 hover:bg-zinc-100" : ""}`}
      onClick={!readOnly ? () => inputRef.current?.click() : undefined}
    >
      {uploading ? (
        <p className="text-sm text-zinc-400">Uploading...</p>
      ) : (
        <>
          <span className="text-3xl">🖼</span>
          <p className="text-sm italic text-zinc-400">{description}</p>
          {!readOnly && (
            <p className="text-xs text-zinc-300">Click to upload an image</p>
          )}
        </>
      )}
      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}
