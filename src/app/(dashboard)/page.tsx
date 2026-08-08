"use client";

import {
  MoneyBag02Icon,
  TrendingUpDownIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useConfiguracao } from "@/hooks/use-configuracao";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { useNotasFiscais } from "@/hooks/use-notas-fiscais";
import { useStatusMensal } from "@/hooks/use-status-mensal";
import { useTransacoes } from "@/hooks/use-transacoes";
import { formatCentavos } from "@/lib/format";
import { calcularSaldoAtual } from "@/lib/saldo";
import {
  CATEGORIA_LABEL,
  valorCaixaLancamentoFixo,
} from "@/types/lancamento-fixo";
import { FluxoMesCard } from "./_components/fluxo-mes-card";
import { SaldoAtualCard } from "./_components/saldo-atual-card";
import { StatCard } from "./_components/stat-card";
import { StatCardSkeleton } from "./_components/stat-card-skeleton";

export default function DashboardPage() {
  const { data: lancamentos, isLoading: isLoadingLancamentos } =
    useLancamentosFixos();
  const { data: configuracao, isLoading: isLoadingConfiguracao } =
    useConfiguracao();
  const { data: transacoes, isLoading: isLoadingTransacoes } = useTransacoes();
  const { data: notasFiscais, isLoading: isLoadingNotasFiscais } =
    useNotasFiscais();
  const { data: statusMensal, isLoading: isLoadingStatusMensal } =
    useStatusMensal();

  const despesasAtivas = (lancamentos ?? []).filter(
    (l) => l.tipo === "despesa" && l.ativo
  );
  const receitasAtivas = (lancamentos ?? []).filter(
    (l) => l.tipo === "receita" && l.ativo
  );

  const totalDespesas = despesasAtivas.reduce(
    (sum, lancamento) => sum + valorCaixaLancamentoFixo(lancamento),
    0
  );
  const totalReceitas = receitasAtivas.reduce(
    (sum, lancamento) => sum + valorCaixaLancamentoFixo(lancamento),
    0
  );
  const saldoProjetado = totalReceitas - totalDespesas;

  const isLoadingSaldoAtual =
    isLoadingConfiguracao ||
    isLoadingLancamentos ||
    isLoadingTransacoes ||
    isLoadingNotasFiscais ||
    isLoadingStatusMensal;

  const saldoAtualCentavos = configuracao
    ? calcularSaldoAtual({
        saldoInicialCentavos: configuracao.saldoInicialCentavos,
        saldoInicialData: configuracao.saldoInicialData,
        lancamentosFixos: lancamentos ?? [],
        transacoes: transacoes ?? [],
        notasFiscais: notasFiscais ?? [],
        statusOverrides: statusMensal ?? [],
        hoje: new Date(),
      })
    : 0;

  const despesasPorCategoria = despesasAtivas.reduce<Record<string, number>>(
    (acc, l) => {
      acc[l.categoria] =
        (acc[l.categoria] ?? 0) + valorCaixaLancamentoFixo(l);
      return acc;
    },
    {}
  );
  const categoriasOrdenadas = Object.entries(despesasPorCategoria).sort(
    (a, b) => b[1] - a[1]
  );

  const isLoading = isLoadingLancamentos;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Projeção mensal com base nos lançamentos fixos ativos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Receitas fixas / mês"
              value={formatCentavos(totalReceitas)}
              icon={MoneyBag02Icon}
              tone="positive"
              hint={`${receitasAtivas.length} lançamento(s) ativo(s)`}
            />
            <StatCard
              label="Despesas fixas / mês"
              value={formatCentavos(totalDespesas)}
              icon={Wallet01Icon}
              tone="negative"
              hint={`${despesasAtivas.length} lançamento(s) ativo(s)`}
            />
            <StatCard
              label="Saldo projetado / mês"
              value={formatCentavos(saldoProjetado)}
              icon={TrendingUpDownIcon}
              tone={saldoProjetado >= 0 ? "positive" : "negative"}
              hint="Receitas fixas - despesas fixas"
            />
          </>
        )}
        <SaldoAtualCard
          saldoAtualCentavos={saldoAtualCentavos}
          isLoading={isLoadingSaldoAtual}
        />
      </div>

      <FluxoMesCard />

      <Card>
        <CardHeader>
          <CardTitle>Despesas fixas por categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : categoriasOrdenadas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma despesa fixa ativa cadastrada ainda.
            </p>
          ) : (
            categoriasOrdenadas.map(([categoria, valor]) => (
              <div key={categoria} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {CATEGORIA_LABEL[categoria as keyof typeof CATEGORIA_LABEL] ??
                      categoria}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCentavos(valor)}
                  </span>
                </div>
                <Progress
                  value={totalDespesas ? (valor / totalDespesas) * 100 : 0}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
