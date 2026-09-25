"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import Script from "next/script";
import { useLanguage } from "@/lib/i18n/context";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      language: string;
      theme: "auto";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

const TURNSTILE_LANGUAGES = { fr: "fr", en: "en", zh: "zh-cn" } as const;

// Les jetons Turnstile sont à usage unique : appeler `reset()` après chaque soumission échouée.
export default function TurnstileWidget({
  onToken,
  ref,
}: {
  onToken: (token: string | null) => void;
  ref?: Ref<TurnstileHandle>;
}) {
  const { locale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current(null);
      if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
    },
  }));

  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!scriptReady || !sitekey || !containerRef.current || !window.turnstile) return;

    const turnstile = window.turnstile;
    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey,
      language: TURNSTILE_LANGUAGES[locale],
      theme: "auto",
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });

    return () => {
      if (widgetIdRef.current) turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      onTokenRef.current(null);
    };
  }, [scriptReady, locale]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
