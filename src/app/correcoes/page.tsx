import Link from "next/link";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Correções",
  description:
    "Como a Ajoia Brasil corrige erro de fato: a matéria permanece no mesmo endereço, com a data de atualização visível.",
  path: "/correcoes",
});

export default function CorrecoesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="kicker">Institucional</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
        Correções
      </h1>
      <div className="mt-8 space-y-6 font-serif text-lg leading-relaxed text-mist-muted">
        <p>
          Erro de fato se corrige. A {siteConfig.name} altera o texto no mesmo
          endereço, registra a data de atualização na página e não republica a
          matéria como se fosse nova.
        </p>
        <p>
          Correção de grafia, título ou informação que mude o sentido do texto
          entra no corpo da matéria, de forma visível. Opinião do colunista não
          é corrigida pela redação: o autor responde pelo que assinou.
        </p>
        <p>
          Para apontar um erro, escreva para{" "}
          <a className="text-gold" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>{" "}
          ou use a página de{" "}
          <Link href="/contato" className="text-gold">
            contato
          </Link>
          , com o link da matéria e a informação que precisa ser revista.
        </p>
      </div>
    </div>
  );
}
