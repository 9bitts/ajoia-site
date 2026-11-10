export type AdCreative = {
  id: string;
  href: string;
  alt: string;
  /** When set, this image replaces the house creative. */
  image?: string;
  external?: boolean;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
};

/** House ads until a real creative is placed in `image`. */
export const headerAds: AdCreative[] = [
  {
    id: "house-header",
    href: "/midia-kit",
    alt: "Anuncie na Ajoia Brasil",
    eyebrow: "Publicidade",
    title: "Anuncie na Ajoia",
    text: "Sua marca no portal de jornalismo independente.",
    cta: "Mídia kit",
  },
];

export const sidebarAds: AdCreative[] = [
  {
    id: "house-side-1",
    href: "/midia-kit",
    alt: "Anuncie na coluna das matérias da Ajoia",
    eyebrow: "Coluna da matéria",
    title: "Sua marca neste espaço",
    text: "Banner ao lado do texto, no ponto de maior leitura.",
    cta: "Ver formatos",
  },
  {
    id: "house-side-2",
    href: "/midia-kit",
    alt: "Leve sua marca ao leitor da Ajoia",
    eyebrow: "Leitor qualificado",
    title: "Política, cidade e opinião",
    text: "Presença para quem acompanha o noticiário com rigor.",
    cta: "Fale com o comercial",
  },
  {
    id: "house-side-3",
    href: "/midia-kit",
    alt: "Peça o mídia kit da Ajoia Brasil",
    eyebrow: "Formatos",
    title: "Topo, matéria e coluna",
    text: "Escolha o espaço e envie a peça. Veiculação de 30 dias.",
    cta: "Pedir mídia kit",
  },
];
