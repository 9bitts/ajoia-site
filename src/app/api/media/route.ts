import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { syncMediaLibrary } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await syncMediaLibrary();
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) || "";
  const assets = await prisma.mediaAsset.findMany({
    where: q
      ? {
          OR: [
            { url: { contains: q, mode: "insensitive" } },
            { alt: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ assets });
}
