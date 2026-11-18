"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function ArticleClickRow({
  href,
  title,
  publicHref,
  socialHref,
  section,
  statusClass,
  statusLabel,
  authorName,
  authorHref,
  whenLabel,
}: {
  href: string;
  title: string;
  publicHref: string | null;
  socialHref: string | null;
  section: string;
  statusClass: string;
  statusLabel: string;
  authorName?: string;
  authorHref?: string | null;
  whenLabel: string;
}) {
  const router = useRouter();
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return (
    <tr
      className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
      onClick={() => router.push(href)}
    >
      <td className="px-4 py-3">
        <Link
          href={href}
          onClick={stop}
          className="font-medium text-white hover:text-gold"
        >
          {title}
        </Link>
        {publicHref && (
          <a
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
            className="relative z-10 ml-3 text-[11px] uppercase tracking-[0.12em] text-mist-dim hover:text-white"
          >
            ver
          </a>
        )}
        {socialHref && (
          <Link
            href={socialHref}
            onClick={stop}
            className="relative z-10 ml-3 text-[11px] uppercase tracking-[0.12em] text-mist-dim hover:text-white"
          >
            redes
          </Link>
        )}
      </td>
      <td className="px-4 py-3 text-mist-muted">{section}</td>
      <td className={`px-4 py-3 ${statusClass}`}>{statusLabel}</td>
      {authorName !== undefined && (
        <td className="px-4 py-3">
          {authorHref ? (
            <Link
              href={authorHref}
              onClick={stop}
              className="relative z-10 text-white hover:text-gold"
            >
              {authorName}
            </Link>
          ) : (
            <span className="text-mist-muted">{authorName}</span>
          )}
        </td>
      )}
      <td className="px-4 py-3 text-mist-dim">{whenLabel}</td>
    </tr>
  );
}
