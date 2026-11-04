"use client";

import { useEffect, useState } from "react";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const validGtm = /^GTM-[A-Z0-9]+$/.test(gtmId);
const validGa = /^G-[A-Z0-9]+$/.test(gaId);
const enabled = validGtm || validGa;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __ajoiaAnalytics?: boolean;
  }
}

function loadTags() {
  if (!enabled || window.__ajoiaAnalytics) return;
  window.__ajoiaAnalytics = true;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
  window.gtag("consent", "update", { analytics_storage: "granted" });

  const script = document.createElement("script");
  script.async = true;
  if (validGtm) {
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  } else {
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.onload = () => {
      window.gtag?.("js", new Date());
      window.gtag?.("config", gaId);
      window.dispatchEvent(new Event("ajoia-analytics-ready"));
    };
  }
  document.head.appendChild(script);
  if (validGtm) {
    window.dispatchEvent(new Event("ajoia-analytics-ready"));
  }
}

export function Analytics() {
  const [choice, setChoice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("ajoia-consent");
    } catch {
      stored = "denied";
    }
    setChoice(stored);
    setReady(true);
    if (stored === "granted") loadTags();
  }, []);

  if (!enabled || !ready || choice) return null;

  function choose(value: "granted" | "denied") {
    try {
      localStorage.setItem("ajoia-consent", value);
    } catch {
      // Sem armazenamento, a escolha vale só nesta tela.
    }
    setChoice(value);
    if (value === "granted") {
      loadTags();
      return;
    }
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[var(--bg)] px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-content flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text)]">
          Medimos a audiência do jornal: páginas lidas e de onde vêm as visitas.
          Os dados servem à redação. Sem o seu aceite, essa medição não começa.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="border border-[var(--line)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-mist-muted"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="btn-primary text-xs uppercase tracking-[0.14em]"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
