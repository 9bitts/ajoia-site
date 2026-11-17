import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isPublic =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/cadastro");
  if (pathname.startsWith("/admin") && !isPublic) {
    const session = await auth();
    if (!session?.user) redirect("/admin/login");
    if (session.user.mustChangePassword && pathname !== "/admin/senha") {
      redirect("/admin/senha");
    }
  }

  return (
    <SessionProvider>
      <div className="admin-shell min-h-screen">
        <AdminNav />
        <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
      </div>
    </SessionProvider>
  );
}
