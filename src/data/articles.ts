export type SectionSlug =
  | "politica"
  | "estado"
  | "cidade"
  | "mundo"
  | "cultura"
  | "opiniao"
  | "editorial"
  | "tema-livre";

export type Article = {
  slug: string;
  title: string;
  dek: string;
  section: SectionSlug;
  authorSlug: string;
  authorName: string;
  date: string;
  featured?: boolean;
  breaking?: boolean;
  imageGradient: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "institutos-de-pesquisas-imprensa-e-maquina-estatal",
    title:
      "Institutos de pesquisas, imprensa e máquina estatal alinhados para confundir a cabeça do eleitor",
    dek: "Estudado pela ciência política como bandwagon effect, o efeito manada descreve a tendência de eleitores apoiarem quem aparenta estar à frente — enquanto outros desistem de votar.",
    section: "politica",
    authorSlug: "jose-aparecido-ribeiro",
    authorName: "José Aparecido Ribeiro",
    date: "2026-07-23",
    featured: true,
    breaking: true,
    imageGradient: "from-zinc-800 via-neutral-900 to-black",
    body: [
      "Vivemos uma época em que a disputa política deixou de acontecer apenas nas ruas, como era antigamente nos palanques. Hoje, ela ocorre, sobretudo, no campo da informação.",
      "Estudado pela ciência política e conhecido como bandwagon effect (efeito manada), o fenômeno descreve a tendência de eleitores apoiarem quem aparenta estar à frente, enquanto outros podem simplesmente desistir de votar.",
      "Para um observador atento, o alinhamento entre institutos de pesquisa, segmentos da imprensa e estruturas do Estado não é coincidência: é mecanismo. Quando números, manchetes e máquinas administrativas convergem para uma narrativa única, o eleitor deixa de deliberar — e passa a reagir.",
      "A Ajoia Brasil reafirma: o compromisso do jornalismo é com os fatos, não com a conveniência de quem disputa o poder. Liberdade de imprensa e responsabilidade editorial não se opõem — uma sustenta a outra.",
      "Em tempos de ruído informacional, clareza é resistência. E a apuração rigorosa permanece o único antídoto contra a confusão fabricada.",
    ],
  },
  {
    slug: "instituto-rodrigo-castanheira-transformando-perda-em-protecao",
    title: "Instituto Rodrigo Castanheira: transformando a perda em proteção",
    dek: "Nascido da maior dor que uma família pode sentir — a perda de um filho —, o instituto transformou luto em propósito: proteger adolescentes e prevenir a violência.",
    section: "cidade",
    authorSlug: "marcia-casali",
    authorName: "Márcia Casali",
    date: "2026-07-23",
    featured: true,
    imageGradient: "from-stone-700 via-neutral-900 to-zinc-950",
    body: [
      "O Instituto Rodrigo Castanheira nasceu da maior dor que uma família pode sentir: a perda de um filho. Rodrigo era apenas um adolescente quando, ao sair de uma festa, foi brutalmente espancado.",
      "Após lutar pela vida na UTI por 16 dias, ele não resistiu. A dor da perda, no entanto, deu lugar a um propósito transformador: a família decidiu erguer uma instituição dedicada à proteção de jovens e à prevenção da violência.",
      "Mais do que memória, o instituto é ação. Em Belo Horizonte e em outras cidades, campanhas educativas, acolhimento e advocacy jurídico buscam impedir que outras famílias atravessem o mesmo silêncio.",
      "Histórias como esta lembram por que o jornalismo local importa: porque a cidade só se reconhece quando olha para as feridas que insiste em esconder.",
    ],
  },
  {
    slug: "noticias-do-dia-23-de-julho",
    title: "Notícias do Dia, Você Bem Informado — 23 de julho",
    dek: "Datas comemorativas, temperatura e indicadores financeiros para começar o dia com o essencial.",
    section: "tema-livre",
    authorSlug: "edy-fernandes",
    authorName: "Edy Fernandes",
    date: "2026-07-23",
    featured: true,
    imageGradient: "from-slate-700 via-zinc-900 to-black",
    body: [
      "Datas comemorativas de hoje: Dia do Guarda Rodoviário, Dia Mundial dos Mamíferos Marinhos, Dia do Limão, Dia do Confeito e Dia da Vovó Maravilhosa.",
      "Temperatura em Macapá-AP: mínima 25° e máxima 29°. Indicadores: Dólar comercial em queda de 0,43% (R$ 5,05); Euro em queda de 0,35% (R$ 5,76); Ibovespa em alta de 2,44% (177.547 pts); Bitcoin em queda de 1,24%.",
      "IGP-M de junho de 2026: −0,5%. INPC de junho: +0,14%. Números para quem acompanha o País sem intermediários — e sem ruído.",
      "O painel diário da Ajoia existe para uma coisa simples: você bem informado, sem enrolação.",
    ],
  },
  {
    slug: "noticias-do-dia-22-de-julho",
    title: "Notícias do Dia, Você Bem Informado — 22 de julho",
    dek: "Do Dia Mundial do Cérebro ao Ibovespa: o essencial do dia em um só lugar.",
    section: "tema-livre",
    authorSlug: "edy-fernandes",
    authorName: "Edy Fernandes",
    date: "2026-07-22",
    imageGradient: "from-neutral-700 via-zinc-900 to-black",
    body: [
      "Entre as datas: Dia do Cantor Lírico, Dia do Cientista Social, Dia Internacional da Manga, Dia Internacional do Trabalhador Doméstico, Dia Mundial do Cérebro e Dia da Paz e da Conciliação.",
      "Indicadores e clima seguem no radar diário da redação. Informação objetiva, sem narrativa embutida — o leitor decide o que fazer com os fatos.",
    ],
  },
  {
    slug: "tragedia-familiar-expoe-falhas-e-busca-por-justica",
    title: "Tragédia familiar expõe falhas e a busca por Justiça",
    dek: "Laudijane, mãe de Breno Filipe Sales, vive um drama duplo: a dor da perda do filho e uma grave batalha contra o câncer.",
    section: "cidade",
    authorSlug: "marcia-casali",
    authorName: "Márcia Casali",
    date: "2026-07-22",
    featured: true,
    imageGradient: "from-zinc-700 via-stone-900 to-black",
    body: [
      "Laudijane, mãe de Breno Filipe Sales, vive um drama duplo — a dor da perda do filho e uma grave batalha contra o câncer. Após a morte de Breno em julho de 2022, ela ficou sete meses em depressão profunda, o que contribuiu para o desenvolvimento de um câncer de mama.",
      "Em outubro de 2025, descobriu metástase. A busca por Justiça se mistura à luta pela própria vida — e revela falhas que o poder público e a sociedade ainda não souberam enfrentar.",
      "O jornalismo independente existe também para isso: dar nome às dores que as instituições preferem tratar como estatística.",
    ],
  },
  {
    slug: "a-conta-da-arrogancia-chegou",
    title: "A conta da arrogância chegou, e será paga pelos brasileiros",
    dek: "Quando relações internacionais viram instrumento de proselitismo ideológico, quem paga é a fábrica, o produtor e o trabalhador — não o gabinete.",
    section: "opiniao",
    authorSlug: "jose-aparecido-ribeiro",
    authorName: "José Aparecido Ribeiro",
    date: "2026-07-17",
    featured: true,
    imageGradient: "from-neutral-800 via-zinc-950 to-black",
    body: [
      "O problema é que a conta da irresponsabilidade, das bravatas e insinuações, não chega ao gabinete presidencial. Ela chega à fábrica que perde encomendas, ao produtor rural que vê seu mercado ameaçado, ao empresário que suspende investimentos e ao trabalhador que teme receber uma carta de demissão.",
      "Quando um governante transforma relações internacionais em instrumento de proselitismo ideológico, é o povo que paga. E paga caro.",
      "Quem ocupa a Presidência da República tem o dever de proteger os interesses nacionais. Se a estratégia adotada produziu isolamento, perda de mercados e ameaça aos empregos, alguém precisa responder por isso.",
      "O Brasil não é propriedade de um presidente nem laboratório de uma ideologia. Nenhuma imprensa digna desse nome tem o direito de esconder da população a gravidade do que está acontecendo.",
    ],
  },
  {
    slug: "ajoia-brasil-e-lancada-com-posicionamento-claro",
    title:
      "Em meio à desinformação e à polarização, Ajoia Brasil é lançada com posicionamento claro",
    dek: "Jornalistas de todo o País e do exterior se unem em defesa da verdade factual e do rigor jornalístico.",
    section: "editorial",
    authorSlug: "neimar-fernandes",
    authorName: "Neimar Fernandes",
    date: "2026-03-23",
    featured: true,
    imageGradient: "from-stone-800 via-neutral-950 to-black",
    body: [
      "Em um cenário marcado por desconfiança, polarização e questionamentos sobre a credibilidade da informação, jornalistas de diferentes regiões do Brasil e do exterior decidiram reagir.",
      "A resposta vem na forma de organização: nasce a Ajoia Brasil (Associação Brasileira de Jornalistas Independentes e Afiliados), com uma proposta clara de resgatar os pilares do jornalismo e recolocar no centro da atividade o compromisso com os fatos.",
      "Com sede em Belo Horizonte, a associação reúne profissionais de doze estados brasileiros e mantém representações no exterior.",
      "Para o presidente José Aparecido Ribeiro: “Acreditamos no Brasil e no jornalismo que não se curva a interesses. Nosso compromisso é com os fatos. Defendemos uma imprensa livre, responsável e comprometida com a democracia e a justiça.”",
      "A Ajoia Brasil nasce com uma convicção: o jornalismo só cumpre seu papel quando se mantém fiel aos fatos, acima de pressões, interesses ou conveniências.",
    ],
  },
  {
    slug: "belo-horizonte-a-deriva-mobilidade-urbana",
    title:
      "Belo Horizonte à deriva: colapso anunciado na mobilidade urbana — e ninguém se manifesta",
    dek: "A degradação da mobilidade em BH deixou de ser problema herdado: é retrato de incompetência administrativa e ausência de liderança.",
    section: "cidade",
    authorSlug: "marcia-casali",
    authorName: "Márcia Casali",
    date: "2026-04-10",
    imageGradient: "from-zinc-700 via-neutral-900 to-zinc-950",
    body: [
      "A degradação da mobilidade urbana em Belo Horizonte já não pode mais ser tratada como um problema estrutural herdado. Trata-se, hoje, de um retrato claro de incompetência administrativa e ausência de liderança.",
      "Enquanto isso, órgãos responsáveis pela infraestrutura seguem inertes diante de mais de 200 gargalos viários que estrangulam a cidade.",
      "Belo Horizonte, que há décadas aguarda intervenções estruturais à altura de sua relevância, tornou-se símbolo de um fracasso administrativo que se acumula e se agrava. A conta já chegou — e é paga todos os dias por quem enfrenta o trânsito.",
    ],
  },
  {
    slug: "anel-rodoviario-de-bh-limites-de-quem-governa",
    title:
      "O Anel Rodoviário de BH escancara os limites de quem escolhemos para nos governar",
    dek: "A via deixou de ser apenas rodovia problemática: tornou-se o retrato da omissão do poder público e da falência da infraestrutura metropolitana.",
    section: "estado",
    authorSlug: "leandro-heringer",
    authorName: "Leandro Heringer",
    date: "2026-05-12",
    imageGradient: "from-neutral-700 via-stone-900 to-black",
    body: [
      "O Anel Rodoviário de Belo Horizonte deixou de ser, há muito tempo, apenas uma rodovia problemática. Tornou-se o retrato acabado da omissão do poder público.",
      "O que se vê na prática é a continuidade de medidas paliativas e soluções cosméticas diante de um colapso estrutural evidente.",
      "A construção do Rodoanel prometida há décadas deixou de ser apenas alternativa de mobilidade. Tornou-se necessidade. Cada atraso burocrático custa vidas reais.",
    ],
  },
  {
    slug: "trevo-do-belvedere-palavra-do-prefeito",
    title: "Trevo do Belvedere: a palavra do prefeito vale quanto?",
    dek: "Passados 435 dias da promessa no Trevo do Belvedere, a população segue aguardando que o anúncio se transforme em obra.",
    section: "cidade",
    authorSlug: "marcia-casali",
    authorName: "Márcia Casali",
    date: "2026-06-25",
    imageGradient: "from-stone-700 via-zinc-900 to-black",
    body: [
      "No dia 13 de abril de 2025, o prefeito de Belo Horizonte, Álvaro Damião, esteve no Trevo do Belvedere para anunciar uma intervenção que ele próprio classificou como paliativa.",
      "Hoje, passados 435 dias, a população continua aguardando que aquela promessa se transforme em realidade.",
      "Administradores passam. Promessas se repetem. Cerimônias acontecem. Mas a realidade permanece praticamente a mesma para quem enfrenta o trânsito todos os dias.",
    ],
  },
  {
    slug: "setor-vitivinicola-brasileiro-minas-gerais",
    title: "Setor vitivinícola brasileiro se consolida em Minas Gerais",
    dek: "Produção, enoturismo e identidade regional: Minas avança no mapa do vinho brasileiro.",
    section: "cultura",
    authorSlug: "adriana-garcia",
    authorName: "Adriana Garcia",
    date: "2026-06-20",
    imageGradient: "from-zinc-800 via-stone-950 to-black",
    body: [
      "O setor vitivinícola brasileiro encontra em Minas Gerais um território de consolidação — com vinícolas que apostam em terroir, enoturismo e identidade regional.",
      "Além da bebida, o movimento fortalece cadeias produtivas locais e coloca o Estado no mapa de experiências gastronômicas do País.",
    ],
  },
  {
    slug: "imprensa-visceral-e-quase-sutil",
    title: "A imprensa que consegue ser visceral e quase sutil ao mesmo tempo",
    dek: "Entre o grito e o silêncio, o jornalismo que importa é o que não abre mão do fato — nem da forma.",
    section: "opiniao",
    authorSlug: "cristina-graeml",
    authorName: "Cristina Graeml",
    date: "2026-07-18",
    imageGradient: "from-neutral-800 via-zinc-900 to-black",
    body: [
      "Há uma imprensa que grita para ser ouvida — e outra que, quase sutil, fura o ruído porque carrega substância.",
      "A Ajoia Brasil aposta no segundo caminho: visceral na defesa dos fatos, sóbria na forma, intransigente na ética.",
    ],
  },
  {
    slug: "silencio-que-doi-mais-que-grito",
    title:
      "Tem um silêncio que dói mais que grito: o de uma mãe cujo telefone não toca mais",
    dek: "Há dores que a cidade normaliza. O jornalismo independente existe para recusar essa normalização.",
    section: "cidade",
    authorSlug: "marcia-casali",
    authorName: "Márcia Casali",
    date: "2026-07-15",
    imageGradient: "from-zinc-800 via-neutral-950 to-black",
    body: [
      "Tem um silêncio que dói mais que grito: é o silêncio de uma mãe cujo telefone não toca mais.",
      "Em cada história dessas há uma falha coletiva — de segurança, de justiça, de escuta. Nomeá-las é o mínimo que uma imprensa responsável pode fazer.",
    ],
  },
  {
    slug: "intervencao-vetor-norte-bh",
    title:
      "Intervenção no vetor Norte de BH precisa ser interrompida para evitar prejuízo bilionário",
    dek: "Especialistas alertam: prazo excessivo transforma obra de R$ 180 milhões em impacto social que pode chegar a R$ 2 bilhões.",
    section: "estado",
    authorSlug: "walter-navarro",
    authorName: "Walter Navarro",
    date: "2026-04-02",
    imageGradient: "from-slate-800 via-zinc-950 to-black",
    body: [
      "Embora o custo direto do projeto seja de aproximadamente R$ 180 milhões, estimativas técnicas indicam que o impacto total para a sociedade pode se aproximar de R$ 2 bilhões.",
      "O motivo é o prazo de execução considerado excessivo: 1.050 dias de transtornos. O “custo do atraso no trânsito” não aparece no contrato — mas pesa diariamente no bolso da população.",
      "Quando o impacto no trânsito não é considerado no planejamento, obras públicas podem deixar de ser solução e se tornar um problema bilionário.",
    ],
  },
  {
    slug: "ajoia-lancada-em-bh",
    title:
      "Ajoia Brasil é lançada em BH com nomes do jornalismo, do empresariado e da política",
    dek: "Cerca de 80 participantes marcaram o lançamento oficial da associação no Barroca Tênis Clube, em Belo Horizonte.",
    section: "editorial",
    authorSlug: "neimar-fernandes",
    authorName: "Neimar Fernandes",
    date: "2026-03-31",
    imageGradient: "from-stone-800 via-zinc-950 to-black",
    body: [
      "Uma noite histórica marcou o lançamento oficial da Associação de Jornalistas Independentes e Afiliados do Brasil durante evento no Antonielli Restaurante e Pizzeria, no Barroca Tênis Clube, em Belo Horizonte.",
      "Com a presença de cerca de 80 participantes, a cerimônia foi definida como marco simbólico para o fortalecimento do jornalismo independente no País.",
      "Houve homenagem ao jornalista José Roberto Guzzo, falecido, que inspirou diretamente a criação da Ajoia Brasil.",
    ],
  },
  {
    slug: "geopolitica-e-imprensa-livre",
    title: "Geopolítica sob tensão: o papel de uma imprensa livre no século XXI",
    dek: "Em um mundo de narrativas em disputa, a apuração independente deixa de ser luxo editorial — e vira infraestrutura democrática.",
    section: "mundo",
    authorSlug: "jorge-bessa",
    authorName: "Jorge Bessa",
    date: "2026-07-10",
    imageGradient: "from-slate-700 via-neutral-900 to-black",
    body: [
      "A disputa geopolítica contemporânea não se limita a fronteiras e mercados: disputa também o sentido dos fatos.",
      "Uma imprensa livre — e responsável — é parte da arquitetura que impede que uma única narrativa se imponha como verdade oficial.",
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesBySection(section: SectionSlug) {
  return articles
    .filter((a) => a.section === section)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticlesByAuthor(authorSlug: string) {
  return articles
    .filter((a) => a.authorSlug === authorSlug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getFeaturedArticles() {
  return articles
    .filter((a) => a.featured)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getLatestArticles(limit = 12) {
  return [...articles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

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
    description:
      "Ideias, artes, hábitos e o que molda o espírito do tempo.",
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
