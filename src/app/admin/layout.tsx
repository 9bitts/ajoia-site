import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminNav />
      <div className="mx-auto max-w-5xl px-5 py-10">{children}</div>
    </SessionProvider>
  );
}
