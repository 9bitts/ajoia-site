import { NextResponse } from "next/server";
import { getMoreArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = Number(url.searchParams.get("offset") || "0");
  const exclude = (url.searchParams.get("exclude") || "").slice(0, 160);
  if (!Number.isFinite(offset) || offset < 0) {
    return NextResponse.json({ error: "Página inválida" }, { status: 400 });
  }
  const page = await getMoreArticles(offset, exclude || undefined);
  return NextResponse.json(page);
}
