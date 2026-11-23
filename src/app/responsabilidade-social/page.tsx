import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Responsabilidade Social",
  description:
    "A responsabilidade social da Ajoia Brasil: ética, transparência, inclusão, diversidade e sustentabilidade.",
  path: "/responsabilidade-social",
});

const paragraphs = [
  "A AJOIA é formada por profissionais que atuam com o principal objetivo do jornalismo; a dedicação e o compromisso com os fatos. Profissionais experientes, não se permitem a contaminação ideológica, tendências ou por oportunismos. Isso não significa que não tenham consciência de suas convicções de qualquer natureza, pois é justamente nessa consciência que estão os pilares da cidadania que os orienta e que aplicam na prática do seu trabalho.",
  "Essa premissa cabe na compreensão mais lúcida para tratativas daquilo que nos envolve enquanto sociedade, criando fatores para uma melhor convivência.",
  "Valoriza todos os movimentos, populares ou não, mas valoriza também bom senso, o conhecimento e o discernimento, não permitindo com isso a massificação do pensamento único.",
  "A Responsabilidade Social é um destes fatores. Muitos valores já estão inseridos no seu próprio estatuto como condição para sua existência e princípios, construindo, assim, seu apoio às responsabilidades sociais. Ética e transparência estão entre esses valores.",
  "Portanto, a comunidade, a inclusão, a diversidade e a sustentabilidade ambiental, terão nosso incentivo e nunca se perderão no horizonte da associação e de seus membros.",
];

export default function ResponsabilidadeSocialPage() {
  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
          Institucional
        </p>
        <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
          Responsabilidade Social
        </h1>
      </header>
      <div className="prose-ajoia mt-10 max-w-none">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
