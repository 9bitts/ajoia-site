import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SocialAccounts } from "@/components/admin/SocialAccounts";
import { META_SCOPES, aiConfig, metaConfig, xConfig } from "@/lib/social/config";
import { publicConnections, publicHandoff } from "@/lib/social/accounts";
import { PAGES_COOKIE } from "@/lib/social/http";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const OK: Record<string, string> = {
  meta: "Facebook conectado. Essa Página não tem Instagram profissional vinculado. Vincule a conta à Página e autorize de novo.",
  meta_ig: "Facebook e Instagram conectados.",
  x: "X conectado.",
};

const ERRO: Record<string, string> = {
  meta_state: "A autorização da Meta expirou. Clique em conectar de novo.",
  meta_denied: "A autorização na Meta foi cancelada.",
  meta_scope:
    "O aplicativo não tem as permissões pedidas. Adicione as permissões listadas abaixo e conecte de novo.",
  meta_token:
    "A Meta não entregou o acesso. Confira o URI de redirecionamento, o ID e a chave secreta.",
  meta_pages: "Nenhuma Página apareceu. Entre com o perfil que administra a Página da Ajoia.",
  x_state: "A autorização do X expirou. Clique em conectar de novo.",
  x_denied: "A autorização no X foi cancelada.",
  x_token: "O X não entregou o acesso. Confira o callback, o ID e a chave do aplicativo.",
};

type Props = {
  searchParams: Promise<{ ok?: string; erro?: string; escolher?: string; detalhe?: string }>;
};

export default async function SocialAdminPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const params = await searchParams;
  const [connections, jar] = await Promise.all([publicConnections(), cookies()]);
  const handoffId = jar.get(PAGES_COOKIE)?.value || "";
  const pages = handoffId ? await publicHandoff(handoffId) : null;
  const origin = siteUrl();
  const notice = params.erro
    ? ERRO[params.erro] || "Não foi possível concluir a conexão."
    : params.ok
      ? OK[params.ok] || ""
      : params.escolher === "1" && !pages
        ? "A escolha da Página expirou. Conecte de novo."
        : "";
  const noticeOk = Boolean(params.ok) && !params.erro;
  const detail =
    params.detalhe &&
    params.detalhe.length < 200 &&
    !/secret|bearer|eyJ/i.test(params.detalhe)
      ? params.detalhe
      : "";

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Administração</p>
      <h1 className="mt-2 font-display text-4xl text-white">Redes</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-muted">
        Conecte uma vez. Em cada matéria publicada, o botão envia o texto daquela rede. A pessoa lê o texto e publica. A IA só entra se alguém clicar em ajustar.
      </p>
      {notice && (
        <p className={`mt-4 text-sm ${noticeOk ? "text-emerald-300" : "text-amber-100"}`}>{notice}</p>
      )}
      {detail && <p className="mt-2 text-sm text-mist-muted">{detail}</p>}
      <div className="mt-8">
        <SocialAccounts
          facebook={connections.FACEBOOK}
          instagram={connections.INSTAGRAM}
          x={connections.X}
          metaReady={Boolean(metaConfig())}
          xReady={Boolean(xConfig())}
          ai={Boolean(aiConfig())}
          pages={pages || []}
        />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="space-y-3 text-sm leading-relaxed text-mist-muted">
          <h2 className="font-display text-2xl text-white">Meta (Facebook e Instagram)</h2>
          <p>
            A tela de apps vazia é o começo certo. Crie o aplicativo e guarde a chave secreta no servidor, não neste chat.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Em developers.facebook.com/apps, clique em Criar aplicativo. Nome: Ajoia Brasil.</li>
            <li>Caso de uso: publicar numa Página e no Instagram. Se pedir o tipo, escolha Empresa.</li>
            <li>
              Em Configurações básicas: domínio <code className="text-white">ajoiabrasil.com.br</code>, URL do site{" "}
              <code className="text-white">{origin}</code> e política de privacidade{" "}
              <code className="text-white">{origin}/privacidade</code>.
            </li>
            <li>
              No Login do Facebook, cole o URI de redirecionamento{" "}
              <code className="text-white">{origin}/api/social/meta/callback</code>.
            </li>
            <li>
              Adicione as permissões <code className="text-white">{META_SCOPES}</code>.
            </li>
            <li>
              Se o app mostrar um ID de configuração do Login para Empresas, coloque em{" "}
              <code className="text-white">META_CONFIG_ID</code>.
            </li>
            <li>
              Copie o ID e a chave secreta para <code className="text-white">META_APP_ID</code> e{" "}
              <code className="text-white">META_APP_SECRET</code> no Railway.
            </li>
            <li>
              A Página precisa existir. O Instagram precisa ser conta profissional vinculada a essa Página, com foto de capa na matéria.
            </li>
            <li>Volte aqui e conecte com o perfil que administra a Página.</li>
          </ol>
          <p>
            Em desenvolvimento, só quem tem função no aplicativo consegue autorizar. Quem cria o app já tem. Isso basta para publicar na Página de vocês.
          </p>
        </section>
        <section className="space-y-3 text-sm leading-relaxed text-mist-muted">
          <h2 className="font-display text-2xl text-white">X</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Em developer.x.com, crie um projeto e um app com permissão de leitura e escrita.</li>
            <li>
              Ative OAuth 2.0, tipo Web App, e cole o callback{" "}
              <code className="text-white">{origin}/api/social/x/callback</code>.
            </li>
            <li>
              Coloque <code className="text-white">X_CLIENT_ID</code> e{" "}
              <code className="text-white">X_CLIENT_SECRET</code> no servidor.
            </li>
            <li>
              Compre créditos no console do X. Publicar cobra por post, e post com link custa mais do que post só de texto. O valor vigente está no console.
            </li>
            <li>Volte aqui e conecte a conta que fala pela Ajoia.</li>
          </ol>
          <h2 className="pt-4 font-display text-2xl text-white">IA</h2>
          <p>
            Opcional. <code className="text-white">SOCIAL_AI_API_KEY</code> aceita uma API no formato da OpenAI. Se quiser a xAI, aponte{" "}
            <code className="text-white">SOCIAL_AI_BASE_URL</code> e <code className="text-white">SOCIAL_AI_MODEL</code>. Sem chave, o texto é título, linha-fina e um trecho da matéria, já no tamanho da rede.
          </p>
        </section>
      </div>
    </div>
  );
}
