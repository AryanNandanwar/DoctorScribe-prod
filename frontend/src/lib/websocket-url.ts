/** Socket.IO server URL (same origin when behind nginx in Docker/production). */
export function getWebSocketUrl(): string {
  const fromEnv = import.meta.env.VITE_REACT_APP_WEBSOCKET_URL;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv.trim();

  // Vite dev server (:5173) does not host Socket.IO — use the Nest backend.
  if (import.meta.env.DEV) {
    const apiBase = import.meta.env.VITE_REACT_APP_API_BASE_URL;
    if (apiBase && String(apiBase).trim() !== "") return String(apiBase).trim();
    return "http://localhost:3000";
  }

  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}
