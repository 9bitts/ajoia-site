"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@/components/Analytics";
import { IntroSplash } from "@/components/IntroSplash";
import { MaintenanceNotice } from "@/components/MaintenanceNotice";

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <IntroSplash />
      <MaintenanceNotice />
      {header}
      <main>{children}</main>
      {footer}
      <Analytics />
    </>
  );
}
