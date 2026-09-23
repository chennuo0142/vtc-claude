import type { ReactNode } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const dict = await getDictionary();

  return (
    <div className="mb-8 flex flex-col gap-2">
      <div className="kicker">{dict.common.administration}</div>
      <div className="flex items-center justify-between gap-4">
        <h1 style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-0.02em" }}>{title}</h1>
        {action}
      </div>
      {description && (
        <p className="text-[14.5px]" style={{ color: "var(--color-neutral-700)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
