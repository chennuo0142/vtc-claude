"use client";

import { THEMES, useTheme } from "@/lib/theme";

export default function ThemeSwitcher() {
  const [active, pick] = useTheme();

  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          aria-label={t.label}
          onClick={() => pick(t.id)}
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
