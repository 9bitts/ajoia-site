import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site-url";

export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
    .split(",")[0]
    ?.trim();
  if (host && originHost === host) return true;

  try {
    return originHost === new URL(siteUrl()).host;
  } catch {
    return false;
  }
}

export function rejectCrossOrigin(req: Request) {
  if (isSameOrigin(req)) return null;
  return NextResponse.json({ error: "Origem recusada." }, { status: 403 });
}
