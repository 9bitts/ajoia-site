import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Envie uma imagem (JPG, PNG ou WebP)" },
      { status: 400 }
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Imagem deve ter no máximo 8MB" },
      { status: 400 }
    );
  }

  try {
    const { saveUploadedImage } = await import("@/lib/upload");
    const url = await saveUploadedImage(file);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Falha ao processar imagem" },
      { status: 500 }
    );
  }
}
