import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { getUploadDir } from "@/lib/upload-dir";

type Params = { params: Promise<{ path: string[] }> };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: Params) {
  const { path: parts } = await params;
  if (parts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) {
    return NextResponse.json({ error: "Inválido" }, { status: 400 });
  }
  const filename = parts.join("/");
  const root = path.resolve(getUploadDir());
  const fullPath = path.resolve(root, filename);
  const relative = path.relative(root, fullPath);
  if (!filename || relative.startsWith("..") || path.isAbsolute(relative)) {
    return NextResponse.json({ error: "Inválido" }, { status: 400 });
  }
  if (!existsSync(fullPath)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const stat = statSync(fullPath);
  const stream = createReadStream(fullPath);
  const webStream = Readable.toWeb(stream) as ReadableStream;
  const ext = path.extname(fullPath).toLowerCase();
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".avif": "image/avif",
  };
  if (!types[ext]) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": types[ext],
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
