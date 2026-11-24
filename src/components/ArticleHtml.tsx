"use client";

import { useEffect, useMemo, useRef } from "react";
import { youtubePosterHtml } from "@/lib/youtube";

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export function ArticleHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useMemo(() => youtubePosterHtml(html), [html]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    function onClick(event: MouseEvent) {
      const button = (event.target as HTMLElement | null)?.closest(".yt-play");
      if (!(button instanceof HTMLElement) || !root?.contains(button)) return;
      const id = button.getAttribute("data-yt") || "";
      if (!YOUTUBE_ID.test(id)) return;
      event.preventDefault();
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = "Vídeo";
      frame.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      button.replaceWith(frame);
    }

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [ready]);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: ready }} />;
}
