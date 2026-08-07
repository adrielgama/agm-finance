"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MonthPicker } from "@/components/month-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfiguracao } from "@/hooks/use-configuracao";
import { useMonthFilter } from "@/hooks/use-month-filter";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { useNotasFiscais } from "@/hooks/use-notas-fiscais";
import { useStatusMensal } from "@/hooks/use-status-mensal";
import { useTransacoes } from "@/hooks/use-transacoes";
import { formatCentavos } from "@/lib/format";
import {
  calcularEventosFluxo,
  calcularReservaMinima,
  calcularSaldoDiario,
  diasNoMes,
} from "@/lib/fluxo-mensal";
import { calcularSaldoBaseParaMes } from "@/lib/saldo";
import { cn } from "@/lib/utils";

const chartConfig: ChartConfig = {
  saldo: {
    label: "Saldo acumulado",
    color: "var(--color-primary)",
  },
};

export function FluxoMesCard() {
  const { mes } = useMonthFilter();
  const { data: lancamentosFixos, isLoading: isLoadingLancamentos } =
    useLancamentosFixos();
  const { data: transacoes, isLoading: isLoadingTransacoes } = useTransacoes();
  const { data: notasFiscais, isLoading: isLoadingNotasFiscais } =
    useNotasFiscais();
  const { data: configuracao, isLoading: isLoadingConfiguracao } =
    useConfiguracao();
  const { data: statusMensal, isLoading: isLoadingStatusMensal } =
    useStatusMensal();

  const isLoading =
    isLoadingLancamentos ||
    isLoadingTransacoes ||
    isLoadingNotasFiscais ||
    isLoadingConfiguracao ||
    isLoadingStatusMensal;

  const transacoesDoMes = (transacoes ?? []).filter(
    (t) => t.data.toISOString().slice(0, 7) === mes
  );

  const eventos = calcularEventosFluxo({
    mes,
    lancamentosFixos: lancamentosFixos ?? [],
    transacoesDoMes,
    notasFiscais: notasFiscais ?? [],
  });

  const saldoBase = configuracao
    ? calcularSaldoBaseParaMes(mes, {
        saldoInicialCentavos: configuracao.saldoInicialCentavos,
        saldoInicialData: configuracao.saldoInicialData,
        lancamentosFixos: lancamentosFixos ?? [],
        transacoes: transacoes ?? [],
        notasFiscais: notasFiscais ?? [],
        statusOverrides: statusMensal ?? [],
        hoje: new Date(),
      })
    : 0;

  const totalDias = diasNoMes(mes);
  const pontos = calcularSaldoDiario(eventos, totalDias, saldoBase);
  const reservaMinima = calcularReservaMinima(pontos);

  const totalDespesas = eventos
    .filter((e) => e.tipo === "despesa")
    .reduce((sum, e) => sum + e.valorCentavos, 0);
  const totalReceitas = eventos
    .filter((e) => e.tipo === "receita")
    .reduce((sum, e) => sum + e.valorCentavos, 0);

  const chartData = pontos.map((p) => ({
    dia: p.dia,
    saldo: p.saldoCentavos / 100,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Fluxo do mês</CardTitle>
        <MonthPicker />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Receitas do mês
                </span>
                <span className="text-xl font-semibold tabular-nums text-positive">
                  {formatCentavos(totalReceitas)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Despesas do mês
                </span>
                <span className="text-xl font-semibold tabular-nums text-negative">
                  {formatCentavos(totalDespesas)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Reserva mínima necessária
                </span>
                <span
                  className={cn(
                    "text-xl font-semibold tabular-nums",
                    reservaMinima > 0 ? "text-negative" : "text-positive"
                  )}
                >
                  {formatCentavos(reservaMinima)}
                </span>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="h-56 w-full">
              <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="dia"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={56}
                  tickFormatter={(value: number) =>
                    value.toLocaleString("pt-BR", {
                      notation: "compact",
                      compactDisplay: "short",
                    })
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCentavos(Number(value) * 100)}
                      labelFormatter={(dia) => `Dia ${dia}`}
                    />
                  }
                />
                <Line
                  dataKey="saldo"
                  type="monotone"
                  stroke="var(--color-saldo)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>

            {eventos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma movimentação prevista para este mês.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {eventos.map((evento, index) => (
                  <div
                    key={`${evento.origem}-${evento.nome}-${index}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-muted-foreground tabular-nums">
                        {String(evento.dia).padStart(2, "0")}
                      </span>
                      <span>{evento.nome}</span>
                    </div>
                    <span
                      className={cn(
                        "tabular-nums",
                        evento.tipo === "despesa" ? "text-negative" : "text-positive"
                      )}
                    >
                      {evento.tipo === "despesa" ? "-" : "+"}
                      {formatCentavos(evento.valorCentavos)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
