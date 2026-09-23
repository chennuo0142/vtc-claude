import { useSyncExternalStore } from "react";

export const THEMES = [
  { id: "default", label: "Acier", swatch: "#5980a6" },
  { id: "navy", label: "Marine", swatch: "#2f4a63" },
  { id: "graphite", label: "Graphite", swatch: "#4a6660" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const listeners = new Set<() => void>();
let cached: ThemeId | null = null;

function readStoredTheme(): ThemeId {
  try {
    return (localStorage.getItem("theme") as ThemeId | null) ?? "default";
  } catch {
    return "default";
  }
}

function getSnapshot(): ThemeId {
  if (cached === null) cached = readStoredTheme();
  return cached;
}

function getServerSnapshot(): ThemeId {
  return "default";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyTheme(id: ThemeId) {
  try {
    if (id === "default") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      document.documentElement.setAttribute("data-theme", id);
      localStorage.setItem("theme", id);
    }
  } catch {}
  cached = id;
  listeners.forEach((listener) => listener());
}

/**
 * The server always renders "default" (no access to localStorage). React's
 * useSyncExternalStore reconciles that with the real client value right after
 * hydration, which is what avoids a hydration mismatch here.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, applyTheme] as const;
}
