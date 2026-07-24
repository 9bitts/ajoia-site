import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { getUploadDir } from "@/lib/upload";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, { params }: Params) {
  const { path: parts } = await params;
  const filename = parts.join("/");
  if (!filename || filename.includes("..")) {
    return NextResponse.json({ error: "Inválido" }, { status: 400 });
  }

  const fullPath = path.join(getUploadDir(), filename);
  if (!existsSync(fullPath)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const stat = statSync(fullPath);
  const stream = createReadStream(fullPath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
