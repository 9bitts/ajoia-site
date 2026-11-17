import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/auth";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  if (await isRateLimited(`login:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Espere alguns minutos." },
      { status: 429 }
    );
  }
  return handlers.POST(req);
}
