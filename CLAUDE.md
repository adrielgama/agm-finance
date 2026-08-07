@AGENTS.md

# AGM Finance

Painel financeiro pessoal da AGM Digital (uso interno, um usuário: Adriel). Controla despesas
fixas, receitas fixas, notas fiscais e projeção de lucro/pró-labore. Deploy solo na Vercel.

## Stack

- Next.js 16 (App Router, `src/app`), React 19, TypeScript.
- Tailwind CSS v4 + shadcn/ui (`components.json`, style `radix-nova`).
- Firebase: **Firestore** como banco de dados — acessado só pelo servidor (Admin SDK), nunca
  pelo browser. **better-auth** (não Firebase Auth) cuida do login social (Google), usando o
  próprio Firestore como storage via `better-auth-firestore`.
- TanStack Query v5 para todas as chamadas de dados (cache, loading, mutations). `staleTime`
  global de 1h (`src/components/providers.tsx`) — de propósito, os dados não mudam toda hora e
  evita refetch excessivo. O botão de refresh manual na Topbar (`queryClient.invalidateQueries()`,
  sem filtro) é o jeito do usuário forçar sync, principalmente depois de eu editar o Firestore
  direto via script (bypassa o cache do browser dele).
- HugeIcons (`@hugeicons/react` + `@hugeicons/core-free-icons`) como única lib de ícones.
- Sonner para toasts. Skeleton (shadcn) para loading.
- Fonte Montserrat (`next/font/google`), aplicada globalmente via `--font-montserrat`.
- **Dark mode único** — não existe toggle nem tema claro. Não adicione `next-themes` nem lógica
  de alternância; é trabalho desperdiçado.

Comandos: `pnpm dev`, `pnpm build`, `pnpm lint`. Sempre rode `pnpm lint` e, para mudanças maiores,
`pnpm build` antes de considerar uma tarefa concluída — o build já pega erros de tipo.

## Estrutura de pastas

- `src/app/(dashboard)/` — route group autenticado (sidebar + topbar). O overview mora em
  `(dashboard)/page.tsx`, ou seja, a home ("/") já é o dashboard logado.
- `src/app/login/` — única rota pública além da API de auth.
- `src/app/api/auth/[...all]/route.ts` — catch-all do better-auth (`toNextJsHandler`). Não crie
  outras rotas de auth; login/logout/callback do Google passam todos por aqui.
- **`_components/` dentro de cada rota** guarda componentes que só aquela rota usa (ex.:
  `(dashboard)/socios/_components/socio-form-dialog.tsx`). Se um componente passa a ser usado por
  mais de uma rota, promova-o para `src/components/`.
- `src/components/ui/` — primitives do shadcn. Não edite à mão além do necessário; prefira
  `pnpm dlx shadcn@latest add <componente>` (rode sempre a partir da raiz do projeto — se o shell
  estiver dentro de `node_modules` o CLI se comporta de forma estranha).
- `src/components/` (fora de `ui/`) — componentes compartilhados entre 2+ rotas (ex.:
  `confirm-delete-dialog.tsx`, `currency-input.tsx`).
- `src/hooks/use-*.ts` — hooks do TanStack Query (um arquivo por domínio: `use-socios.ts`,
  `use-lancamentos-fixos.ts`). `queryFn`/`mutationFn` chamam Server Actions de
  `src/lib/firestore/*.ts` diretamente — do ponto de vista do hook é só uma função async, o RPC é
  automático do Next.js. Todo hook de mutação já dispara toast de sucesso/erro e invalida a query
  relevante — não duplique isso nos componentes.
- `src/lib/firestore/*.ts` — **Server Actions** (`"use server"` no topo do arquivo) que acessam o
  Firestore via Admin SDK (`getAdminDb()`): `list*`, `create*`, `update*`, `delete*`. Cada função
  chama `verifySession()` primeiro — é a única camada de autorização, já que as Firestore Rules são
  `deny all`. Nunca importe isso de um Client Component como se fosse dado direto; só os hooks
  chamam essas funções. Coleções hoje: `socios`, `lancamentosFixos` (recorrentes, template
  mensal), `notasFiscais` (receita real por competência/cliente), `transacoes` (pontual, não
  recorrente — despesas extras e `aporte_socio`), `statusMensalLancamentos` (override de
  pago/recebido por mês de um `LancamentoFixo`, ver "Controle do mês e saldo real" abaixo),
  `configuracoes` (doc único `geral` com o saldo inicial da conta).
- `src/lib/firebase/admin.ts` — Admin SDK, **server-only**, inicialização lazy via `getAdminDb()`
  (não importe o objeto direto nem inicialize no topo do módulo — quebra o build sem credenciais
  reais). Único ponto de acesso ao Firestore para dados da aplicação.
- `src/lib/auth/` — `auth.ts` (instância do better-auth, com `firestoreAdapter`), `auth-client.ts`
  (`createAuthClient`, usado em Client Components), `dal.ts` (`verifySession()`, protege Server
  Components/Server Actions), `allow-list.ts` (checa e-mail permitido).
- `src/types/*.ts` — tipos de domínio + input types (`Omit<T, "id" | "createdAt" | "updatedAt">`).

## Padrão de uma feature nova (CRUD Firestore)

Siga o que já existe em `socios` e `lancamentos-fixos` como referência:

1. Tipo em `src/types/<dominio>.ts` (`Entidade` + `EntidadeInput`).
2. Server Actions em `src/lib/firestore/<dominio>.ts` (`"use server"` no topo): `verifySession()`
   primeiro em cada função, depois Admin SDK (`getAdminDb()`). `firestoreConverter<T>()`
   (`src/lib/firestore/converter.ts`) só na leitura (`.withConverter()` na query); escritas usam a
   collection/doc ref crua, com `FieldValue.serverTimestamp()` em `createdAt`/`updatedAt`.
3. Hooks em `src/hooks/use-<dominio>.ts`: `useQuery` para listagem, `useMutation` por operação,
   toast + `invalidateQueries` no `onSuccess`.
4. UI em `src/app/(dashboard)/<rota>/`: `page.tsx` fino (orquestra hooks + estados de
   loading/empty) e `_components/` para tabela, dialog de formulário e skeleton.
5. Toda escrita passa por confirmação: `ConfirmDeleteDialog` (`src/components/`) para exclusões,
   `Dialog` do shadcn para criar/editar.
6. Reset de formulário ao abrir um dialog de edição: faça isso no `onOpenChange` do `Dialog`
   (evento), **nunca** em `useEffect` — o lint (`react-hooks/set-state-in-effect`) bloqueia isso.

Qual coleção usar pra um dado novo:

- **Recorrente, mesmo valor todo mês** (contabilidade, plano de saúde, pró-labore) →
  `LancamentoFixo` (`tipo` despesa/receita, `diaVencimento`).
- **Receita de verdade, ligada a uma nota fiscal** → `NotaFiscal` (nunca `LancamentoFixo` tipo
  receita pra isso — evita contar duas vezes; ver "Notas fiscais x lançamentos fixos" abaixo).
- **Pontual, não recorrente** (despesa extra tipo boleto atrasado, aporte de sócio) →
  `Transacao` — tem `data` exata, não `diaVencimento`.
- **Valor recorrente mas variável** (ex.: DAS — mensal, porém proporcional à receita emitida,
  não tem valor fixo) → `Transacao` também, não `LancamentoFixo`. `Transacao.data` é a data real do
  pagamento, não a competência — DAS pago no mês M é sempre competência M-1 (vence dia 20). O botão
  "Lançar DAS do mês" (`transacoes/page.tsx`) já calcula isso — não monte o nome com o mês
  selecionado no filtro direto, calcule o mês anterior.

## Notas fiscais x lançamentos fixos

Receita é `NotaFiscal`, não `LancamentoFixo`. Um `LancamentoFixo` assume o mesmo valor todo mês,
o que não reflete receita de prestação de serviço (varia por cliente, pode mudar de mês pra mês,
cliente pode sair). Se o usuário tiver `LancamentoFixo` com `tipo: "receita"` ainda ativo, ele
conta em cima da receita de `NotaFiscal` no Fluxo do mês (dashboard) — sinalize a duplicidade e
sugira desativar (não apagar — mantém histórico).

`NotaFiscal.mesReferencia` é a **competência** (a que trabalho a nota se refere), pode ser
diferente do mês de `dataEmissao` — ex.: nota emitida no dia 1 do mês seguinte ao trabalho
prestado. `dataRecebimentoPrevista`/`dataRecebimentoReal` existem separados porque emissão e
recebimento raramente coincidem (cada cliente tem o próprio prazo). O Fator R usa
`calcularReceitaAnualPorNotasFiscais()` (`src/lib/fator-r.ts`): média dos últimos até 12 meses de
competência com nota, anualizada — não tenta prever perda/ganho de cliente, é só histórico.

## Controle do mês e saldo real

Rota `/mes` (`(dashboard)/mes/page.tsx`) é um checklist de pago/recebido pro mês filtrado —
separado da "Visão geral", que é só projeção. É a partir dele que o "Saldo atual em conta"
(dashboard) e a base do gráfico "Fluxo do mês" ficam batendo com o extrato real, em vez de
assumir que tudo que está previsto já aconteceu.

- **`Transacao.pago`** e **`NotaFiscal.dataRecebimentoReal`** já guardam o status direto no
  próprio documento — um por linha, sem necessidade de override.
- **`LancamentoFixo`** é diferente: é um template único reaproveitado todo mês, então o status
  não cabe no próprio doc. Fica em `statusMensalLancamentos` (`src/lib/firestore/status-mensal.ts`),
  um doc por override manual, id determinístico `${lancamentoFixoId}_${mes}` (upsert via
  `.set()`). **Sem doc = sem override**, não "não pago" — o status efetivo nesse caso é inferido
  pela data (ver abaixo). A coleção inteira é buscada de uma vez (sem filtro de mês), igual
  `transacoes`/`notasFiscais` — o volume é baixo (só overrides manuais, não uma ocorrência por
  mês).
- `src/lib/saldo.ts` centraliza a lógica: `statusEfetivoLancamentoFixo()` decide o status quando
  não há override — **vencimento no passado é presumido pago, hoje/futuro fica pendente**. Isso
  evita ter que marcar retroativamente todo o histórico só pra saldo bater; só é preciso mexer no
  Controle do mês quando a realidade diverge do padrão (algo não foi pago apesar de já ter
  vencido, ou foi pago adiantado).
- `configuracoes/geral` (`src/lib/firestore/configuracao.ts`) guarda `saldoInicialCentavos` +
  `saldoInicialData` — o saldo real da conta numa data de referência, editável a qualquer momento
  pelo ícone de lápis no card "Saldo atual em conta". `calcularSaldoAtual()` soma a esse valor
  tudo que foi confirmado (pago/recebido, efetivo ou por override) entre essa data e hoje.
  `calcularSaldoBaseParaMes()` faz o mesmo até o fim do mês anterior ao filtrado — é o que
  `FluxoMesCard` usa como ponto de partida do gráfico, em vez de sempre começar do zero.
- Sem `configuracoes/geral` cadastrado, saldo atual mostra R$ 0,00 e o card avisa "Defina o saldo
  inicial" — é o usuário quem precisa informar o valor real, não dá pra inferir.

## Filtro por período

Filtro é sempre por **mês**, nunca por intervalo de dias — decisão explícita do usuário. Use
`useMonthFilter()` (`src/hooks/use-month-filter.ts`, estado guardado em `?mes=YYYY-MM` na URL) +
`<MonthPicker />` (`src/components/month-picker.tsx`) em qualquer tela nova que precise filtrar
por período (ver `notas-fiscais` e `transacoes` como referência).

## Dinheiro

Valores monetários são sempre `valorCentavos: number` (inteiro, em centavos) no Firestore e nos
tipos — nunca float em reais. Formatar para exibição com `formatCentavos()` de `src/lib/format.ts`.
Inputs de valor guardam uma string separada só para exibição (`"1.234,56"`) e convertem para
centavos a cada mudança (ver `lancamento-form-dialog.tsx`).

## Autenticação

Fluxo: `GoogleSignInButton` (client) → `authClient.signIn.social({ provider: "google" })`
(`src/lib/auth/auth-client.ts`) → redirect clássico pro Google e volta pro **próprio domínio**
(`/api/auth/callback/google`, tratado pelo catch-all do better-auth) → sessão já criada nesse
ponto → `src/proxy.ts` faz o check otimista (`getSessionCookie()` do `better-auth/cookies`) →
`verifySession()` (`src/lib/auth/dal.ts`, usa `auth.api.getSession()`) faz o check seguro
(sessão + allow-list) em toda página/Server Action protegida.

- **Não é Firebase Auth**: trocamos pro better-auth porque `signInWithPopup`/`signInWithRedirect`
  do Firebase Auth dependem de um iframe/popup cross-origin pro domínio
  `<project>.firebaseapp.com`, que navegadores com bloqueio de storage de terceiros (padrão hoje)
  quebram de formas obscuras (erros de COOP, `init.json` 404). O better-auth faz OAuth "clássico"
  — o callback do Google fica sempre no seu próprio domínio, http simples em dev, sem popup, sem
  iframe, sem certificado autoassinado. Não volte pro Firebase Auth sem motivo muito forte.
- **`better-auth-firestore`**: adapter comunitário (não oficial) que guarda as tabelas do
  better-auth (`user`, `session`, `account`, `verification`) no mesmo Firestore, via uma app
  Firebase Admin secundária nomeada `"better-auth"` (`src/lib/auth/auth.ts`, `initFirestore`) —
  separada da app default usada por `src/lib/firebase/admin.ts`. Se o login começar a falhar de
  formas estranhas depois de atualizar dependências, esse pacote pequeno é o primeiro suspeito.
- **Uso único**: só o e-mail em `AUTH_ALLOWED_EMAILS` consegue passar por `verifySession()`. Os
  outros dois sócios (Abimael, Monyse) existem só como registros na coleção `socios`, sem conta
  própria — não construa multi-login sem o usuário pedir explicitamente. Qualquer conta Google
  consegue _autenticar_ (o better-auth cria o usuário), mas só o e-mail permitido passa da allow
  list pra acessar qualquer página/Server Action.
- `proxy.ts` (não `middleware.ts` — Next 16 renomeou) só lê a presença do cookie de sessão, nunca
  verifica a assinatura ali. A verificação real fica na DAL.
- Variáveis: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (Google Cloud Console — pode reaproveitar o
  OAuth client que o Firebase já criou no mesmo projeto GCP), `BETTER_AUTH_SECRET` (`openssl rand
-base64 32`), `BETTER_AUTH_URL` (origem do app: `http://localhost:3000` em dev). Authorized
  redirect URI no Google Cloud precisa incluir `<BETTER_AUTH_URL>/api/auth/callback/google`.

## Firestore

- **Nenhum acesso direto do client** — não há SDK client de Firebase no projeto. Toda leitura e
  escrita passa por Server Actions em `src/lib/firestore/*.ts` (Admin SDK, `getAdminDb()`),
  chamadas pelos hooks do TanStack Query. `firestore.rules` é `allow read, write: if false` de
  propósito — as regras não fazem nenhum trabalho de autorização, isso é 100% responsabilidade do
  `verifySession()` dentro de cada Server Action.
- Deploy de regras (raramente muda, já que são deny-all): `firebase deploy --only firestore:rules`
  (precisa do Firebase CLI logado e do projeto certo em `.firebaserc`).
- O mesmo Firestore guarda tanto os dados da aplicação (sócios, lançamentos fixos, ...) quanto as
  tabelas do better-auth — são coleções diferentes, sem relação entre si além de compartilhar o
  projeto.

## UI / componentes

- Ícones: sempre `HugeiconsIcon` de `@hugeicons/react` + import nomeado de
  `@hugeicons/core-free-icons` (ex.: `import { Wallet01Icon } from "@hugeicons/core-free-icons"`).
  Não introduza outra lib de ícones. Componentes internos do shadcn que já vêm com `lucide-react`
  (ex.: `sonner.tsx`) podem manter lucide — não vale a pena reescrever o gerado pelo CLI.
- Cores: tokens em `src/app/globals.css` (`:root`/`.dark` idênticos — dark-only). Use as classes
  Tailwind semânticas (`bg-card`, `text-muted-foreground`, `text-positive`/`text-negative` para
  ganho/perda) em vez de cores hardcoded.
- Todo carregamento de dado assíncrono usa `Skeleton` no formato do conteúdo final (ver
  `StatCardSkeleton`, `SociosTableSkeleton`) — não usar spinner genérico de página inteira para
  listagens.
- Toasts via `sonner`, sempre com o método tipado certo — nunca `toast()` genérico:
  `toast.success` (mutação deu certo), `toast.error` (falhou), `toast.info` (só informativo, sem
  sucesso/falha). Já ficam centralizados dentro dos hooks de mutação — componentes de UI não devem
  chamar `toast()` diretamente para CRUD. `Toaster` (`src/components/ui/sonner.tsx`) já vem com
  `richColors` e `position="top-right"` configurados — não duplique isso ao usar `toast()`.
- Inputs de valor monetário: sempre `CurrencyInput` (`src/components/currency-input.tsx`), nunca um
  `Input` cru pra dinheiro. Ele mascara como input de banco — os dígitos digitados preenchem os
  centavos da direita pra esquerda, ignora qualquer separador que o usuário tente digitar.
- Gráficos: `src/components/ui/chart.tsx` (shadcn, Recharts por baixo) — `ChartContainer` +
  `ChartConfig` com `color: "var(--color-<token>)"` apontando pros tokens de
  `src/app/globals.css`, nunca hex direto no `ChartConfig`. Ver `fluxo-mes-card.tsx` como
  referência de uso com `LineChart`.
- Datas: sempre `DatePicker` (`src/components/date-picker.tsx`, um dia) ou
  `MonthCalendarPopover` (`src/components/month-calendar-popover.tsx`, mês — `variant="full"` em
  formulário, `variant="icon"` em barra de filtro) — nunca `<input type="date">`/`type="month">`
  cru. Os dois usam `Calendar`/`Popover` do shadcn (`captionLayout="dropdown"`, locale `ptBR` de
  `date-fns/locale`) e normalizam pra meio-dia UTC (evita o dia mudar por fuso horário).
- Botões de ícone: sempre com tooltip. Ação simples (só `onClick`) → `IconButton`
  (`src/components/icon-button.tsx`). Ação que é _também_ trigger de `Dialog`/`AlertDialog`
  (editar/excluir nas tabelas) → `TooltipWrap` (`src/components/tooltip-wrap.tsx`) por fora +
  `TooltipTrigger asChild` por dentro do trigger do dialog (ver `socios-table.tsx`) — não dá pra
  usar o `IconButton` aí porque o Tooltip.Root não repassa props de DOM, só funciona com a mesma
  cadeia de `asChild` que o Dialog usa.
