"use client";

/**
 * Renders lesson page content formatted as a classroom slide.
 * Handles:
 * - Bullet points (lines starting with - or •)
 * - ALL CAPS terms (rendered bold)
 * - [INSERT IMAGE: description] placeholders
 * - Short lines rendered as distinct blocks
 */

interface SlideContentProps {
  text: string;
  className?: string;
}

function renderLine(line: string, index: number) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Image placeholder
  const imageMatch = trimmed.match(/^\[INSERT IMAGE[:\s]*(.*?)\]$/i);
  if (imageMatch) {
    return (
      <div
        key={index}
        className="flex items-center gap-3 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400 italic"
      >
        <span className="text-lg">🖼</span>
        <span>{imageMatch[1] || "Image"}</span>
      </div>
    );
  }

  // Bullet point
  if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
    const content = trimmed.replace(/^[-•]\s+/, "");
    return (
      <div key={index} className="flex items-start gap-2">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        <span className="text-sm leading-relaxed">{renderInline(content)}</span>
      </div>
    );
  }

  // Short ALL CAPS line — treat as a heading/keyword
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 1 && /[A-Z]/.test(trimmed)) {
    return (
      <p key={index} className="font-bold text-base tracking-wide text-foreground">
        {trimmed}
      </p>
    );
  }

  // Regular line
  return (
    <p key={index} className="text-sm leading-relaxed text-foreground">
      {renderInline(trimmed)}
    </p>
  );
}

function renderInline(text: string) {
  // Bold **text** or ALL CAPS words
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function SlideContent({ text, className = "" }: SlideContentProps) {
  const lines = text.split("\n");

  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  );
}
