# Ajoia Brasil — Portal

Novo site da **Associação Brasileira de Jornalistas Independentes e Afiliados**, com painel admin para colunistas.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- Auth.js (login de admin/colunistas)
- Upload de imagens (sharp)

## Desenvolvimento local

### 1. Banco

```bash
docker compose up -d
```

### 2. Ambiente

Copie `.env.example` para `.env` (já há um `.env` de exemplo local no repositório de desenvolvimento).

### 3. Instalar e popular

```bash
npm install
npm run db:setup
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

**Login padrão (seed):**

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | `admin@ajoiabrasil.com.br` | `AjoiaAdmin2026!` |
| Colunistas | `jose.aparecido@ajoiabrasil.com.br` (etc.) | `Colunista2026!` |

Altere via `ADMIN_PASSWORD` / `COLUMNIST_PASSWORD` antes do seed.

## Admin

- **Colunista:** cria/edita os próprios artigos, sobe imagem, salva rascunho ou publica
- **Admin:** vê todos os artigos, marca destaque, cria contas em `/admin/usuarios`

## Railway

1. Adicione **PostgreSQL** e vincule `DATABASE_URL` ao serviço do site.
2. Variáveis:
   - `DATABASE_URL` (do Postgres)
   - `AUTH_SECRET` (ex.: `openssl rand -base64 32`)
   - `AUTH_TRUST_HOST=true`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `COLUMNIST_PASSWORD` (opcional, para re-seed)
   - `UPLOAD_DIR=/data/uploads`
3. Monte um **Volume** em `/data` (persistir uploads).
4. Deploy. No primeiro boot: `npx prisma db push` (já no start) e rode **uma vez**:

```bash
npx prisma db seed
```

(ou `npm run db:seed` no shell do Railway)

## Estrutura editorial

Capa, seções, colunistas, artigos e institucional — conteúdo publicado vem do banco.
