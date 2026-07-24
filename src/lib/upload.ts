import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/upload-dir";

export { getUploadDir };

export async function saveUploadedImage(file: File) {
  const sharp = (await import("sharp")).default;
  const bytes = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(bytes)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();

  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, compressed);

  return `/uploads/${filename}`;
}
