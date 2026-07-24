export type SectionSlug =
  | "politica"
  | "estado"
  | "cidade"
  | "mundo"
  | "cultura"
  | "opiniao"
  | "editorial"
  | "tema-livre";

export const SECTIONS: SectionSlug[] = [
  "politica",
  "estado",
  "cidade",
  "mundo",
  "cultura",
  "opiniao",
  "editorial",
  "tema-livre",
];

export const sectionMeta: Record<
  SectionSlug,
  { label: string; description: string }
> = {
  politica: {
    label: "Política",
    description:
      "Poder, eleições e o debate público — com apuração independente e compromisso com os fatos.",
  },
  estado: {
    label: "Estado",
    description:
      "Minas Gerais em perspectiva: governo, infraestrutura e decisões que afetam milhões.",
  },
  cidade: {
    label: "Cidade",
    description:
      "Belo Horizonte e a vida urbana: mobilidade, sociedade e as histórias que a capital não pode ignorar.",
  },
  mundo: {
    label: "Mundo",
    description:
      "O cenário internacional e seus reflexos no Brasil, sem filtro ideológico.",
  },
  cultura: {
    label: "Cultura",
    description: "Ideias, artes, hábitos e o que molda o espírito do tempo.",
  },
  opiniao: {
    label: "Opinião",
    description:
      "Análises e posicionamentos dos colunistas — de inteira responsabilidade de seus autores.",
  },
  editorial: {
    label: "Editorial",
    description:
      "A voz institucional da Ajoia Brasil sobre imprensa, ética e liberdade de expressão.",
  },
  "tema-livre": {
    label: "Tema Livre",
    description:
      "Painéis diários, crônicas e textos que fogem ao roteiro — sem abrir mão da informação.",
  },
};

export function isSectionSlug(value: string): value is SectionSlug {
  return SECTIONS.includes(value as SectionSlug);
}
