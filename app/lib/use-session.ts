"use client";

import { useSearchParams } from "next/navigation";
import { getSessionId, setSessionId } from "./session";

export function useSession(): string | null {
  const searchParams = useSearchParams();
  const urlSession = searchParams.get("session");

  if (urlSession) {
    setSessionId(urlSession);
    return urlSession;
  }

  return getSessionId();
}

export function useSessionHeaders(): Record<string, string> {
  const sessionId = useSession();
  return sessionId ? { "x-session-id": sessionId } : {};
}
