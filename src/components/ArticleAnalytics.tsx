"use client";

import { useEffect } from "react";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

type Props = {
  section: string;
  author: string;
  title: string;
};

function consentGranted() {
  try {
    return localStorage.getItem("ajoia-consent") === "granted";
  } catch {
    return false;
  }
}

export function ArticleAnalytics({ section, author, title }: Props) {
  useEffect(() => {
    if (!gtmId && !gaId) return;
    let sent = false;

    function send() {
      if (sent || !consentGranted()) return;
      const payload = {
        article_section: section,
        article_author: author,
        article_title: title,
      };
      window.dataLayer = window.dataLayer || [];
      if (gtmId) {
        window.dataLayer.push({ event: "article_view", ...payload });
      } else if (typeof window.gtag === "function") {
        window.gtag("event", "article_view", payload);
      } else {
        return;
      }
      sent = true;
    }

    if (window.__ajoiaAnalytics) send();
    window.addEventListener("ajoia-analytics-ready", send);
    return () => window.removeEventListener("ajoia-analytics-ready", send);
  }, [section, author, title]);

  return null;
}
