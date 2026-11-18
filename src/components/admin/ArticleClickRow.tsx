"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function ArticleClickRow({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
      onClick={() => router.push(href)}
    >
      {children}
    </tr>
  );
}
