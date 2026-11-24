"use client";

import { CartView } from "@/components/store/CartView";

const field =
  "mt-2 w-full border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--text)] outline-none";

export function CheckoutForm() {
  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <p className="text-sm leading-relaxed text-mist-muted">
          Estes dados serão usados quando a cobrança for ligada. O botão Pagar é o único lugar que inicia o pagamento.
        </p>
        <label className="block text-sm text-mist-muted">
          Nome
          <input name="name" autoComplete="name" className={field} />
        </label>
        <label className="block text-sm text-mist-muted">
          E-mail
          <input name="email" type="email" autoComplete="email" className={field} />
        </label>
        <label className="block text-sm text-mist-muted">
          Telefone
          <input name="phone" autoComplete="tel" className={field} />
        </label>
        <label className="block text-sm text-mist-muted">
          CEP
          <input name="zip" autoComplete="postal-code" className={field} />
        </label>
        <label className="block text-sm text-mist-muted">
          Endereço
          <input name="line" autoComplete="street-address" className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
          <label className="block text-sm text-mist-muted">
            Cidade
            <input name="city" autoComplete="address-level2" className={field} />
          </label>
          <label className="block text-sm text-mist-muted">
            UF
            <input name="state" autoComplete="address-level1" maxLength={2} className={field} />
          </label>
        </div>
        <button
          type="button"
          disabled
          className="btn-primary cursor-not-allowed text-xs uppercase tracking-[0.14em] opacity-50"
        >
          Pagar
        </button>
        <p className="text-sm text-mist-muted">
          O pagamento ainda não cobra. Na próxima etapa este botão cria o pedido e segue para o Mercado Pago.
        </p>
      </form>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">Sacola</p>
        <CartView showCheckoutLink={false} />
      </div>
    </div>
  );
}
