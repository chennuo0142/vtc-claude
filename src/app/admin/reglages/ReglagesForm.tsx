"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/i18n/context";

function Corners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}

function Row({
  label,
  description,
  children,
  last = false,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 py-5"
      style={{ borderBottom: last ? "none" : "1px solid var(--color-divider)" }}
    >
      <div className="min-w-0 max-w-sm">
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>{label}</div>
        <p className="mt-1 text-[13px] leading-[1.5]" style={{ color: "var(--color-neutral-700)" }}>
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function ReglagesForm({ cardsPerPage }: { cardsPerPage: number }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminReglages;
  const [cards, setCards] = useState(cardsPerPage);
  const [theme, pickTheme] = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function setClampedCards(n: number) {
    setCards(Math.max(1, Math.min(100, Number.isFinite(n) ? n : 1)));
    setSuccess(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/reglages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardsPerPage: cards }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? dict.common.erreurGenerique);
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.erreurGenerique);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="blueprint relative flex flex-col p-6" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 className="pb-2" style={{ color: "var(--color-neutral-700)" }}>
          {t.general}
        </h6>

        <Row
          label={t.cartesParPageLabel}
          description={t.cartesParPageDescription}
        >
          <div className="flex items-center" style={{ border: "1px solid var(--color-divider)", background: "var(--color-bg)" }}>
            <button
              type="button"
              onClick={() => setClampedCards(cards - 1)}
              className="flex h-9 w-9 items-center justify-center text-lg"
              style={{ color: "var(--color-text)" }}
            >
              −
            </button>
            <input
              type="number"
              name="cardsPerPage"
              min={1}
              max={100}
              value={cards}
              onChange={(e) => setClampedCards(parseInt(e.target.value, 10))}
              required
              className="w-12 bg-transparent text-center text-[15px] font-medium outline-none"
              style={{ fontFamily: "var(--font-heading)" }}
            />
            <button
              type="button"
              onClick={() => setClampedCards(cards + 1)}
              className="flex h-9 w-9 items-center justify-center text-lg"
              style={{ color: "var(--color-text)" }}
            >
              +
            </button>
          </div>
        </Row>

        <Row
          label={t.apparenceLabel}
          description={t.apparenceDescription}
          last
        >
          <div className="flex gap-2">
            {THEMES.map((themeOption) => {
              const active = theme === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => pickTheme(themeOption.id)}
                  className="flex h-9 items-center gap-2 px-3 text-[13px]"
                  style={{
                    border: `1px solid ${active ? "var(--color-accent)" : "var(--color-divider)"}`,
                    color: active ? "var(--color-accent-700, var(--color-accent))" : "var(--color-text)",
                    background: "var(--color-bg)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: themeOption.swatch }}
                  />
                  {themeOption.label}
                </button>
              );
            })}
          </div>
        </Row>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button type="submit" disabled={loading} className="btn btn-primary blueprint relative">
          <Corners />
          {loading ? dict.common.enregistrement : dict.common.enregistrer}
        </button>
        {success && (
          <span className="text-[13px]" style={{ color: "var(--color-accent-700, var(--color-accent))" }}>
            {t.reglagesEnregistres}
          </span>
        )}
        {error && (
          <span className="text-[13px]" style={{ color: "#c2463d" }}>
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
