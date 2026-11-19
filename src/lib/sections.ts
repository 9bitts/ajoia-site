export type SectionSlug =
  | "politica"
  | "editorial"
  | "nacional"
  | "internacional"
  | "cultura"
  | "saude"
  | "colunistas"
  | "tema-livre"
  | "ultimas"
  | "opiniao"
  | "economia"
  | "estado"
  | "cidade"
  | "mundo";

/** Seções oferecidas no admin e no menu do site. */
export const SECTIONS: SectionSlug[] = [
  "politica",
  "editorial",
  "nacional",
  "internacional",
  "cultura",
  "saude",
  "colunistas",
  "tema-livre",
  "ultimas",
  "opiniao",
  "economia",
];

/** Slugs antigos: continuam válidos para matérias e URLs já publicadas. */
export const LEGACY_SECTIONS: SectionSlug[] = ["estado", "cidade", "mundo"];

export const sectionMeta: Record<
  SectionSlug,
  { label: string; description: string }
> = {
  politica: {
    label: "Política",
    description:
      "Poder, eleições e o debate público — com apuração independente e compromisso com os fatos.",
  },
  editorial: {
    label: "Editorial",
    description:
      "A voz institucional da Ajoia Brasil sobre imprensa, ética e liberdade de expressão.",
  },
  nacional: {
    label: "Nacional",
    description:
      "O Brasil em perspectiva: governo, Congresso e as decisões que atravessam o País.",
  },
  internacional: {
    label: "Internacional",
    description:
      "O cenário internacional e seus reflexos no Brasil, sem filtro ideológico.",
  },
  cultura: {
    label: "Cultura",
    description: "Ideias, artes, hábitos e o que molda o espírito do tempo.",
  },
  saude: {
    label: "Saúde",
    description:
      "Saúde pública, ciência e o que muda o cuidado com as pessoas.",
  },
  colunistas: {
    label: "Colunistas",
    description:
      "Os textos dos colunistas da Ajoia Brasil — de inteira responsabilidade de seus autores.",
  },
  "tema-livre": {
    label: "Tema Livre",
    description:
      "Painéis diários, crônicas e textos que fogem ao roteiro — sem abrir mão da informação.",
  },
  ultimas: {
    label: "Últimas",
    description: "O que acaba de acontecer, em primeira mão.",
  },
  opiniao: {
    label: "Opinião",
    description:
      "Análises e posicionamentos dos colunistas — de inteira responsabilidade de seus autores.",
  },
  economia: {
    label: "Economia",
    description:
      "Mercado, contas públicas e o que move a economia do País.",
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
};

const ALL_SECTIONS = new Set<string>([...SECTIONS, ...LEGACY_SECTIONS]);

export function isSectionSlug(value: string): value is SectionSlug {
  return ALL_SECTIONS.has(value);
}

const opinionSections = new Set<SectionSlug>([
  "opiniao",
  "editorial",
  "tema-livre",
]);

export function sectionDefaultsToOpinion(section: string) {
  return opinionSections.has(section as SectionSlug);
}
