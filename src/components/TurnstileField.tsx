"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileField() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let widgetId = "";
    const timer = window.setInterval(() => {
      if (!ref.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(ref.current, { sitekey: siteKey });
      window.clearInterval(timer);
    }, 200);
    return () => {
      window.clearInterval(timer);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} className="min-h-16" />;
}
