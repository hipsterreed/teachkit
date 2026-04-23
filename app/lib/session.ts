const SESSION_KEY = "teachkit_session_id";

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;

  // Check URL first
  const params = new URLSearchParams(window.location.search);
  const urlSession = params.get("session");
  if (urlSession) {
    // Persist to localStorage if found in URL
    localStorage.setItem(SESSION_KEY, urlSession);
    return urlSession;
  }

  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function sessionHeaders(): HeadersInit {
  const id = getSessionId();
  return id ? { "x-session-id": id } : {};
}
