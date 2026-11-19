import { createHash } from "crypto";
import { existsSync, statSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadDir } from "@/lib/upload-dir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTHS = [64, 128, 256, 384, 640, 750, 828, 1080, 1200, 1600, 1920];

function snapWidth(value: string | null) {
  const requested = Number(value);
  const target = Number.isFinite(requested) ? requested : 1200;
  return WIDTHS.reduce((best, width) =>
    Math.abs(width - target) < Math.abs(best - target) ? width : best
  );
}

function clampQuality(value: string | null) {
  const quality = Number(value);
  if (!Number.isFinite(quality)) return 75;
  return Math.min(82, Math.max(60, Math.round(quality)));
}

function resolveImageFile(src: string) {
  let pathname = src.split("?")[0] || "";
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (
    !pathname.startsWith("/") ||
    pathname.includes("\\") ||
    pathname.includes("\0") ||
    pathname.includes("..")
  ) {
    return null;
  }
  const uploads = pathname.startsWith("/uploads/");
  const media = pathname.startsWith("/media/") || pathname.startsWith("/images/");
  if (!uploads && !media) return null;

  const root = path.resolve(uploads ? getUploadDir() : path.join(process.cwd(), "public"));
  const relativePath = uploads ? pathname.slice("/uploads/".length) : pathname.slice(1);
  const full = path.resolve(root, relativePath);
  const fromRoot = path.relative(root, full);
  if (fromRoot.startsWith("..") || path.isAbsolute(fromRoot)) return null;
  if (!existsSync(full)) return null;
  return full;
}

function originalType(file: string) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const file = resolveImageFile(url.searchParams.get("src") || "");
  if (!file) return new NextResponse("Não encontrado", { status: 404 });

  const ext = path.extname(file).toLowerCase();
  if (ext === ".gif" || ext === ".svg") {
    const original = await readFile(file);
    return new NextResponse(new Uint8Array(original), {
      headers: {
        "Content-Type": originalType(file),
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const width = snapWidth(url.searchParams.get("w"));
  const quality = clampQuality(url.searchParams.get("q"));
  const stat = statSync(file);
  const key = createHash("sha1")
    .update(`${file}|${stat.mtimeMs}|${stat.size}|${width}|${quality}`)
    .digest("hex");
  const cacheFile = path.join(os.tmpdir(), "ajoia-img", `${key}.webp`);

  if (!existsSync(cacheFile)) {
    const sharp = (await import("sharp")).default;
    await mkdir(path.dirname(cacheFile), { recursive: true });
    const output = await sharp(await readFile(file))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await writeFile(cacheFile, output);
  }

  const body = await readFile(cacheFile);
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
