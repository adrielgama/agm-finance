# AGM Finance

Painel financeiro pessoal da **AGM Digital** — uso interno, um único usuário (Adriel). Controla
despesas e receitas fixas, notas fiscais reais, transações pontuais, aportes de sócio, projeção
de lucro/pró-labore (Fator R / Simples Nacional) e saldo de conta reconciliado com a realidade.
Deploy solo na Vercel.

## O que o app faz

- **Visão geral** (`/`) — projeção mensal com base nos lançamentos fixos ativos, saldo atual em
  conta e o gráfico "Fluxo do mês" (entradas/saídas dia a dia, com reserva mínima necessária).
- **Controle do mês** (`/mes`) — checklist de "a pagar" / "a receber" do mês filtrado, pra marcar
  o que já foi efetivamente pago/recebido. É esse status confirmado que alimenta o saldo real —
  o resto do app é só projeção.
- **Lançamentos fixos** (`/lancamentos-fixos`) — despesas e receitas recorrentes com o mesmo valor
  todo mês (contabilidade, plano de saúde, pró-labore, ferramentas...).
- **Notas fiscais** (`/notas-fiscais`) — receita real de prestação de serviço, por cliente e
  competência, com datas de emissão e recebimento (previsto vs. real) separadas.
- **Transações** (`/transacoes`) — movimentações pontuais, não recorrentes: despesas extras, DAS
  (proporcional à receita, não é valor fixo), aportes de sócio.
- **Sócios** (`/socios`) — cadastro dos sócios da empresa (Adriel, Abimael, Monyse).
- **Fator R** (`/fator-r`) — calculadora de enquadramento tributário (Simples Nacional, Anexo III
  vs. V), usando a receita anualizada real das notas fiscais dos últimos 12 meses.

## Stack

| Camada              | Tecnologia                                                                      |
| ------------------- | ------------------------------------------------------------------------------- |
| Framework           | Next.js 16 (App Router), React 19, TypeScript                                   |
| Estilo              | Tailwind CSS v4 + shadcn/ui (`style: radix-nova`), dark mode único (sem toggle) |
| Dados               | Firestore, acessado só pelo servidor via Admin SDK (Server Actions)             |
| Autenticação        | better-auth (login social Google) — não Firebase Auth                           |
| Cache/estado remoto | TanStack Query v5 (`staleTime` de 1h + botão de refresh manual)                 |
| Gráficos            | Recharts, via `ChartContainer` do shadcn                                        |
| Ícones              | HugeIcons (`@hugeicons/react`)                                                  |
| Toasts              | Sonner                                                                          |
| Fonte               | Montserrat (`next/font/google`)                                                 |

Não há SDK client de Firebase no bundle do browser — toda leitura/escrita passa por Server
Actions (`"use server"`) em `src/lib/firestore/*.ts`, chamadas pelos hooks do TanStack Query.

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — credenciais de uma
  conta de serviço do Firebase (Console → Configurações do projeto → Contas de serviço). É o
  único jeito do app falar com o Firestore, e também o banco por trás das tabelas do better-auth.
- `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) e `BETTER_AUTH_URL` (`http://localhost:3000`
  em dev) — sessão do better-auth.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth client do Google Cloud Console (pode
  reaproveitar o que o Firebase já cria no mesmo projeto GCP). O redirect URI autorizado precisa
  incluir `<BETTER_AUTH_URL>/api/auth/callback/google`.
- `AUTH_ALLOWED_EMAILS` — allow-list de e-mails que conseguem passar da autenticação pro app
  (qualquer conta Google consegue logar, só quem está nessa lista acessa as páginas).

### Scripts

```bash
pnpm dev     # servidor de desenvolvimento (Turbopack)
pnpm build   # build de produção — também valida tipos
pnpm lint    # ESLint
```

Rode `pnpm lint` sempre, e `pnpm build` para mudanças maiores, antes de considerar algo pronto.

## Autenticação

Login social via Google, mas **não** é Firebase Auth — o `signInWithPopup`/`signInWithRedirect`
do Firebase Auth depende de um iframe/popup cross-origin que navegadores com bloqueio de storage
de terceiros quebram de formas obscuras. Em vez disso:

1. `GoogleSignInButton` (client) chama `authClient.signIn.social({ provider: "google" })`.
2. Redirect clássico pro Google e volta pro **próprio domínio**
   (`/api/auth/callback/google`, tratado pelo catch-all do better-auth em
   `src/app/api/auth/[...all]/route.ts`).
3. `src/proxy.ts` (Next 16 renomeou `middleware.ts`) faz um check otimista — só lê se existe
   cookie de sessão, não verifica assinatura.
4. `verifySession()` (`src/lib/auth/dal.ts`) faz o check real (sessão válida + e-mail na
   allow-list) em toda página/Server Action protegida — é a única camada de autorização, já que
   as Firestore Rules são `deny all`.

As tabelas do better-auth (`user`, `session`, `account`, `verification`) moram no mesmo Firestore
que os dados da aplicação, via o adapter comunitário `better-auth-firestore`, numa app Firebase
Admin secundária nomeada `"better-auth"` — separada da app `"admin"` usada pelos dados do app.

## Modelo de dados (Firestore)

| Coleção                   | O que guarda                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `socios`                  | Cadastro dos sócios.                                                                                                 |
| `lancamentosFixos`        | Template recorrente (despesa/receita), mesmo valor todo mês, com dia de vencimento.                                  |
| `notasFiscais`            | Receita real por cliente/competência — emissão e recebimento (previsto/real) separados.                              |
| `transacoes`              | Movimentação pontual, com data exata e flag `pago`.                                                                  |
| `statusMensalLancamentos` | Override de pago/recebido de um `LancamentoFixo` num mês específico (o template é único, o status é por ocorrência). |
| `configuracoes`           | Doc único `geral` com o saldo real da conta numa data de referência.                                                 |

Regras do Firestore são `allow read, write: if false` (deny-all) de propósito — toda autorização
acontece em `verifySession()` dentro de cada Server Action, não nas rules.

### Saldo real vs. projeção

O app distingue **projeção** (o que está previsto acontecer) de **confirmado** (o que já
aconteceu de fato):

- `Transacao.pago` e `NotaFiscal.dataRecebimentoReal` guardam o status direto no documento.
- `LancamentoFixo`, por ser um template reaproveitado todo mês, usa overrides em
  `statusMensalLancamentos`. Sem override, o status é inferido pela data — vencimento no passado
  é presumido pago, hoje/futuro fica pendente — pra não exigir marcar retroativamente todo o
  histórico.
- O saldo real da conta (`configuracoes/geral`) é a base; o "Saldo atual em conta" soma a esse
  valor tudo que foi confirmado desde a data de referência. O gráfico "Fluxo do mês" parte desse
  mesmo saldo acumulado em vez de sempre reiniciar em zero a cada mês.

Toda essa lógica está centralizada em `src/lib/saldo.ts`.

### Dinheiro

Valores monetários são sempre `valorCentavos: number` (inteiro, em centavos) — nunca float em
reais. Formatação pra exibição via `formatCentavos()` (`src/lib/format.ts`). Inputs de valor usam
`CurrencyInput`, que mascara como input de banco (dígitos preenchem os centavos da direita pra
esquerda).

## Estrutura de pastas

```
src/
├─ app/
│  ├─ (dashboard)/        # route group autenticado (sidebar + topbar)
│  │  ├─ page.tsx         # Visão geral — home ("/") já é o dashboard logado
│  │  ├─ mes/             # Controle do mês
│  │  ├─ lancamentos-fixos/
│  │  ├─ notas-fiscais/
│  │  ├─ transacoes/
│  │  ├─ socios/
│  │  └─ fator-r/
│  │     └─ .../_components/   # componentes usados só por aquela rota
│  ├─ login/              # única rota pública além da API de auth
│  └─ api/auth/[...all]/  # catch-all do better-auth
├─ components/            # compartilhados entre 2+ rotas (ui/ tem os primitives do shadcn)
├─ hooks/use-*.ts         # um hook por domínio — useQuery/useMutation do TanStack Query
├─ lib/
│  ├─ firestore/*.ts      # Server Actions ("use server") — únicas com acesso ao Admin SDK
│  ├─ firebase/admin.ts   # inicialização lazy do Admin SDK
│  ├─ auth/               # instância do better-auth, client, DAL, allow-list
│  ├─ saldo.ts            # status efetivo + cálculo de saldo real
│  ├─ fluxo-mensal.ts     # eventos e saldo diário do gráfico "Fluxo do mês"
│  └─ fator-r.ts          # cálculo de enquadramento tributário
├─ types/*.ts             # tipos de domínio + input types
└─ proxy.ts                # Next 16 — equivalente ao antigo middleware.ts
```

## Deploy

Deploy solo na [Vercel](https://vercel.com). As Firestore Rules raramente mudam (são deny-all),
mas quando precisar: `firebase deploy --only firestore:rules` (Firebase CLI logado, projeto
certo em `.firebaserc`).

## Mais detalhes

Convenções de código, padrões de feature nova, e decisões de design mais específicas estão
documentadas em [`CLAUDE.md`](./CLAUDE.md) — é o guia usado pelo Claude Code pra trabalhar neste
repositório, mas serve como referência técnica pra qualquer pessoa mexendo no projeto.
