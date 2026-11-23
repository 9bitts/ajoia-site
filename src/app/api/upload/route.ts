import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { accountId } from "@/lib/account-id";
import { clientIp, isRateLimited, recordUpload, uploadOverQuota } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  const id = accountId(session);
  if (!session?.user || !id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const ip = clientIp(req);
  if (await isRateLimited(`upload:${id}:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitos envios em pouco tempo. Tente de novo mais tarde." },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }

  if (!file.type.startsWith("image/") && file.type !== "video/mp4" && file.type !== "video/webm") {
    return NextResponse.json(
      { error: "Envie uma imagem (JPG, PNG ou WebP) ou um vídeo MP4/WebM" },
      { status: 400 }
    );
  }

  const video = file.type.startsWith("video/");
  const max = video ? 30 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > max) {
    return NextResponse.json(
      { error: video ? "O vídeo deve ter no máximo 30MB" : "Imagem deve ter no máximo 8MB" },
      { status: 400 }
    );
  }

  if (await uploadOverQuota(id, file.size)) {
    return NextResponse.json(
      { error: "Cota diária de envios esgotada (15 arquivos ou 40 MB)." },
      { status: 429 }
    );
  }

  try {
    const { saveUploadedImage, saveUploadedVideo } = await import("@/lib/upload");
    const { recordMedia } = await import("@/lib/media");
    const url = video ? await saveUploadedVideo(file) : await saveUploadedImage(file);
    await recordUpload(id, file.size);
    await recordMedia({ url, bytes: file.size, userId: id });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Falha ao processar o arquivo" },
      { status: 500 }
    );
  }
}
