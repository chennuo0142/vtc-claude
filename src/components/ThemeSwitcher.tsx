"use client";

import { useState } from "react";

const THEMES = [
  { id: "default", label: "Acier", swatch: "#5980a6" },
  { id: "navy", label: "Marine", swatch: "#2f4a63" },
  { id: "graphite", label: "Graphite", swatch: "#4a6660" },
] as const;

function getInitialTheme(): string {
  if (typeof window === "undefined") return "default";
  try {
    return localStorage.getItem("theme") ?? "default";
  } catch {
    return "default";
  }
}

export default function ThemeSwitcher() {
  const [active, setActive] = useState<string>(getInitialTheme);

  function applyTheme(id: string) {
    setActive(id);
    try {
      if (id === "default") {
        document.documentElement.removeAttribute("data-theme");
        localStorage.removeItem("theme");
      } else {
        document.documentElement.setAttribute("data-theme", id);
        localStorage.setItem("theme", id);
      }
    } catch {}
  }

  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          aria-label={t.label}
          onClick={() => applyTheme(t.id)}
          className="h-4 w-4 rounded-full border transition"
          style={{
            background: t.swatch,
            borderColor: active === t.id ? t.swatch : "var(--color-divider)",
            boxShadow: active === t.id ? `0 0 0 2px var(--color-bg), 0 0 0 3px ${t.swatch}` : "none",
          }}
        />
      ))}
    </div>
  );
}
