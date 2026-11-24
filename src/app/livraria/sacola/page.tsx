import { CartView } from "@/components/store/CartView";

export const metadata = {
  title: "Sacola",
  robots: { index: false, follow: false },
};

export default function SacolaPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-5 md:py-14">
      <p className="kicker">Livraria</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">Sacola</h1>
      <CartView />
    </div>
  );
}
