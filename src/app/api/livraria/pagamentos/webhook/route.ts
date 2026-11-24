import { NextResponse } from "next/server";
import { settlePaidOrder } from "@/lib/store-orders";

/**
 * Fase 2 — Mercado Pago Checkout Pro.
 * Esta é a única rota que pode confirmar pagamento. Ela chama settlePaidOrder
 * somente depois da assinatura do Mercado Pago. A página de retorno do comprador
 * não altera pedido nem estoque.
 *
 * Enquanto MERCADO_PAGO_WEBHOOK_SECRET não existir, a cobrança não está ligada.
 */
export async function POST(req: Request) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Pagamento ainda não integrado." }, { status: 503 });
  }

  const signature = req.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 401 });
  }

  // A conferência criptográfica da assinatura entra com as credenciais do Mercado Pago.
  // Até lá, settlePaidOrder permanece de propósito sem ser chamado.
  void settlePaidOrder;
  return NextResponse.json(
    { error: "Conferência do Mercado Pago ainda não está ligada. Nenhum pedido foi alterado." },
    { status: 501 },
  );
}
