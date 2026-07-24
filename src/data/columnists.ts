export type Columnist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  featured?: boolean;
};

export const columnists: Columnist[] = [
  {
    slug: "jose-aparecido-ribeiro",
    name: "José Aparecido Ribeiro",
    role: "Presidente · Opinião e Política",
    bio: "Jornalista e presidente da Ajoia Brasil. Defensor da liberdade de imprensa, do rigor factual e da independência editorial.",
    featured: true,
  },
  {
    slug: "marcia-casali",
    name: "Márcia Casali",
    role: "Cidade e Sociedade",
    bio: "Cobertura de Belo Horizonte, causas sociais e histórias que revelam o cotidiano da capital mineira.",
    featured: true,
  },
  {
    slug: "edy-fernandes",
    name: "Edy Fernandes",
    role: "Tema Livre · Notícias do Dia",
    bio: "Painel diário com datas, indicadores e o que importa acompanhar — com leveza e informação.",
    featured: true,
  },
  {
    slug: "neimar-fernandes",
    name: "Neimar Fernandes",
    role: "Fundador · Editorial",
    bio: "Um dos fundadores da associação. Atua na articulação institucional e na defesa do jornalismo independente.",
    featured: true,
  },
  {
    slug: "alexandre-siqueira",
    name: "Alexandre Siqueira",
    role: "Análise · Imprensa",
    bio: "Autor de “Jornalismo: a um passo do abismo…”. Análise crítica sobre os rumos da imprensa brasileira.",
  },
  {
    slug: "dan-berg",
    name: "Dan Berg",
    role: "Cultura e Literatura",
    bio: "Autor de “Sociedade dos Poetas Vivos”. Percorre tradição literária e formação cultural do País.",
  },
  {
    slug: "cristina-graeml",
    name: "Cristina Graeml",
    role: "Opinião",
    bio: "Colunista com olhar crítico sobre política, liberdade de expressão e o debate público contemporâneo.",
  },
  {
    slug: "leandro-heringer",
    name: "Leandro Heringer",
    role: "Estado e Política",
    bio: "Acompanha o cenário político mineiro e nacional com ênfase em responsabilidade pública.",
  },
  {
    slug: "walter-navarro",
    name: "Walter Navarro",
    role: "Economia e Negócios",
    bio: "Análises sobre economia, mercado e os impactos das decisões públicas no cotidiano brasileiro.",
  },
  {
    slug: "adriana-garcia",
    name: "Adriana Garcia",
    role: "Cultura",
    bio: "Cobertura cultural, comportamento e os movimentos que moldam a sociedade.",
  },
  {
    slug: "jorge-bessa",
    name: "Jorge Bessa",
    role: "Mundo",
    bio: "Cenário internacional e seus reflexos no Brasil, com leitura independente dos fatos.",
  },
  {
    slug: "silvia-faga",
    name: "Sílvia Fagá",
    role: "Opinião",
    bio: "Textos de opinião com foco em cidadania, ética e o papel da imprensa na democracia.",
  },
];

export function getColumnist(slug: string) {
  return columnists.find((c) => c.slug === slug);
}
