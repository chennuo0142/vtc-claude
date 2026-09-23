import type { ReactNode } from "react";

export default function AdminRow({
  leading,
  title,
  subtitle,
  meta,
  actions,
  last = false,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 py-4"
      style={{ borderBottom: last ? "none" : "1px solid var(--color-divider)" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>{title}</div>
          {subtitle && (
            <div className="truncate text-[13px]" style={{ color: "var(--color-neutral-700)" }}>
              {subtitle}
            </div>
          )}
          {meta && (
            <div className="text-[13px]" style={{ color: "var(--color-neutral-700)" }}>
              {meta}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
