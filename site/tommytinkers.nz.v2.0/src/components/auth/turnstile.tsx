"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile: the "are you a person" check on sign-up. It usually
// passes by itself with no puzzle. Cloudflare's script draws the widget and
// hands back a token, which the sign-up request sends along; the server
// (the captcha plugin in src/server/auth.ts) asks Cloudflare if it's real.

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: { sitekey: string; theme: "light" | "dark"; callback: (token: string) => void; "expired-callback": () => void },
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Adds Cloudflare's script to the page once, and resolves when it's ready. */
function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => (window.turnstile ? resolve(window.turnstile) : reject()));
    script.addEventListener("error", () => reject());
  });
}

type TurnstileProps = {
  siteKey: string;
  /** Called with a token when the check passes, and "" when it expires. */
  onToken: (token: string) => void;
};

export function Turnstile({ siteKey, onToken }: TurnstileProps) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !holder.current) return;
        widgetId = turnstile.render(holder.current, {
          sitekey: siteKey,
          theme: document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark",
          callback: onToken,
          "expired-callback": () => onToken(""),
        });
      })
      // If the script is blocked, sign-up will fail the server's check and
      // the form says so. Nothing more to do here.
      .catch(() => {});

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, onToken]);

  // min-height keeps the form from jumping when the widget appears.
  return <div ref={holder} className="min-h-[65px]" />;
}
