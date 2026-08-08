"use client";

import { MonthPicker } from "@/components/month-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfiguracao } from "@/hooks/use-configuracao";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { useMonthFilter } from "@/hooks/use-month-filter";
import {
  useNotasFiscais,
  useUpdateNotaFiscal,
} from "@/hooks/use-notas-fiscais";
import {
  useSetStatusMensalLancamento,
  useStatusMensal,
} from "@/hooks/use-status-mensal";
import { useTransacoes, useUpdateTransacao } from "@/hooks/use-transacoes";
import { calcularEventosFluxo } from "@/lib/fluxo-mensal";
import { formatCentavos } from "@/lib/format";
import {
  calcularResumoCaixa,
  type MovimentoProjetado,
} from "@/lib/projecao-caixa";
import { calcularSaldoAtual, dataOcorrenciaLancamentoFixo } from "@/lib/saldo";
import {
  CATEGORIA_LABEL,
  valorCaixaLancamentoFixo,
} from "@/types/lancamento-fixo";
import {
  ControleSecao,
  ControleSecaoSkeleton,
} from "./_components/controle-secao";
import {
  AdiantamentoLucroCard,
  ResumoCaixaCards,
} from "./_components/resumo-caixa-cards";
import type { ItemControle } from "./_components/tipos";

function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

function proximoMes(mes: string) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, numeroMes, 1, 12));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dataDoMes(mes: string, dia: number) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  return new Date(Date.UTC(ano, numeroMes - 1, dia, 12));
}

function somaPor(itens: ItemControle[], pago: boolean) {
  return itens
    .filter((item) => item.pago === pago)
    .reduce((total, item) => total + item.valorCentavos, 0);
}

function comoMovimento(item: ItemControle): MovimentoProjetado {
  return {
    data: item.data,
    tipo: item.tipo,
    valorCentavos: item.valorCentavos,
  };
}

export default function ControleMesPage() {
  const { mes } = useMonthFilter();
  const { data: configuracao, isLoading: isLoadingConfiguracao } =
    useConfiguracao();
  const { data: lancamentosFixos, isLoading: isLoadingFixos } =
    useLancamentosFixos();
  const { data: transacoes, isLoading: isLoadingTransacoes } = useTransacoes();
  const { data: notasFiscais, isLoading: isLoadingNotasFiscais } =
    useNotasFiscais();
  const { data: statusMensal, isLoading: isLoadingStatus } = useStatusMensal();

  const setStatusFixo = useSetStatusMensalLancamento();
  const updateTransacao = useUpdateTransacao();
  const updateNotaFiscal = useUpdateNotaFiscal();

  const isLoading =
    isLoadingConfiguracao ||
    isLoadingFixos ||
    isLoadingTransacoes ||
    isLoadingNotasFiscais ||
    isLoadingStatus;

  const overrides = statusMensal ?? [];
  const overridePorLancamentoMes = new Map(
    overrides.map((override) => [
      `${override.lancamentoFixoId}_${override.mes}`,
      override,
    ]),
  );

  const itensFixos: ItemControle[] = (lancamentosFixos ?? [])
    .filter((lancamento) => lancamento.ativo)
    .map((lancamento) => {
      const dataPrevista = dataOcorrenciaLancamentoFixo(lancamento, mes);
      const override = overridePorLancamentoMes.get(`${lancamento.id}_${mes}`);
      const pago = override?.pago ?? false;
      const valorPrevisto = valorCaixaLancamentoFixo(lancamento);

      return {
        key: `fixo-${lancamento.id}`,
        tipo: lancamento.tipo,
        nome: lancamento.nome,
        categoria: CATEGORIA_LABEL[lancamento.categoria],
        data: pago ? (override?.dataPagamento ?? dataPrevista) : dataPrevista,
        valorCentavos: pago
          ? (override?.valorRealCentavos ?? valorPrevisto)
          : valorPrevisto,
        pago,
        onConfirm: (dataPagamento, valorRealCentavos) =>
          setStatusFixo.mutate({
            lancamentoFixoId: lancamento.id,
            mes,
            pago: true,
            dataPagamento,
            valorRealCentavos,
          }),
        onUnconfirm: () =>
          setStatusFixo.mutate({
            lancamentoFixoId: lancamento.id,
            mes,
            pago: false,
          }),
        isToggling: setStatusFixo.isPending,
      };
    });

  const itensTransacoes: ItemControle[] = (transacoes ?? [])
    .filter((transacao) => transacao.data.toISOString().slice(0, 7) === mes)
    .map((transacao) => ({
      key: `transacao-${transacao.id}`,
      tipo: transacao.tipo,
      nome: transacao.nome,
      categoria: CATEGORIA_LABEL[transacao.categoria],
      data: transacao.data,
      valorCentavos: transacao.valorCentavos,
      pago: transacao.pago,
      onConfirm: (data, valorCentavos) =>
        updateTransacao.mutate({
          id: transacao.id,
          input: { pago: true, data, valorCentavos },
        }),
      onUnconfirm: () =>
        updateTransacao.mutate({
          id: transacao.id,
          input: { pago: false },
        }),
      isToggling: updateTransacao.isPending,
    }));

  const itensNotasFiscais: ItemControle[] = (notasFiscais ?? [])
    .filter((notaFiscal) => {
      const recebimento =
        notaFiscal.dataRecebimentoReal ?? notaFiscal.dataRecebimentoPrevista;
      return recebimento?.toISOString().slice(0, 7) === mes;
    })
    .map((notaFiscal) => {
      const recebimento = (notaFiscal.dataRecebimentoReal ??
        notaFiscal.dataRecebimentoPrevista)!;
      const recebido = notaFiscal.dataRecebimentoReal !== null;

      return {
        key: `nf-${notaFiscal.id}`,
        tipo: "receita" as const,
        nome: `NF ${notaFiscal.cliente}`,
        categoria: "Nota fiscal",
        data: recebimento,
        valorCentavos: notaFiscal.valorCentavos,
        pago: recebido,
        onConfirm: (dataRecebimentoReal, valorCentavos) =>
          updateNotaFiscal.mutate({
            id: notaFiscal.id,
            input: { dataRecebimentoReal, valorCentavos },
          }),
        onUnconfirm: () =>
          updateNotaFiscal.mutate({
            id: notaFiscal.id,
            input: { dataRecebimentoReal: null },
          }),
        isToggling: updateNotaFiscal.isPending,
      };
    });

  const despesas = [...itensFixos, ...itensTransacoes]
    .filter((item) => item.tipo === "despesa")
    .sort((a, b) => a.data.getTime() - b.data.getTime());
  const receitas = [...itensFixos, ...itensTransacoes, ...itensNotasFiscais]
    .filter((item) => item.tipo === "receita")
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  const saldoAtualCentavos = configuracao
    ? calcularSaldoAtual({
        saldoInicialCentavos: configuracao.saldoInicialCentavos,
        saldoInicialData: configuracao.saldoInicialData,
        lancamentosFixos: lancamentosFixos ?? [],
        transacoes: transacoes ?? [],
        notasFiscais: notasFiscais ?? [],
        statusOverrides: overrides,
        hoje: new Date(),
      })
    : 0;

  const movimentosPendentesMes = [...despesas, ...receitas]
    .filter((item) => !item.pago)
    .map(comoMovimento);

  const mesSeguinte = proximoMes(mes);
  const transacoesProximoMes = (transacoes ?? []).filter(
    (transacao) => transacao.data.toISOString().slice(0, 7) === mesSeguinte,
  );
  const eventosProximoMes = calcularEventosFluxo({
    mes: mesSeguinte,
    lancamentosFixos: lancamentosFixos ?? [],
    transacoesDoMes: transacoesProximoMes,
    notasFiscais: notasFiscais ?? [],
  });
  const proximoRecebimento = eventosProximoMes.find(
    (evento) => evento.origem === "nota-fiscal" && evento.tipo === "receita",
  );
  const eventosAteProximoRecebimento = proximoRecebimento
    ? eventosProximoMes.filter(
        (evento) =>
          evento !== proximoRecebimento && evento.dia <= proximoRecebimento.dia,
      )
    : eventosProximoMes;
  const movimentosAteProximoRecebimento = eventosAteProximoRecebimento.map(
    (evento) => ({
      data: dataDoMes(mesSeguinte, evento.dia),
      tipo: evento.tipo,
      valorCentavos: evento.valorCentavos,
    }),
  );

  const resumo = calcularResumoCaixa({
    saldoAtualCentavos,
    movimentosPendentesMes,
    movimentosAteProximoRecebimento,
    margemSegurancaCentavos: configuracao?.margemSegurancaCentavos ?? 100_000,
  });
  const margemSegurancaCentavos =
    configuracao?.margemSegurancaCentavos ?? 100_000;
  const horizonteReserva = proximoRecebimento
    ? `até ${proximoRecebimento.nome} em ${String(proximoRecebimento.dia).padStart(2, "0")}/${mesSeguinte.slice(5)}`
    : `até o fim de ${mesSeguinte}`;
  const totalReceitas = somaPor(receitas, true) + somaPor(receitas, false);
  const totalDespesas = somaPor(despesas, true) + somaPor(despesas, false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Controle do mês</h1>
          <p className="text-sm text-muted-foreground">
            Confirme o que movimentou a conta e veja quanto precisa permanecer
            reservado antes de uma retirada.
          </p>
        </div>
        <MonthPicker />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <>
          {mes === mesAtual() && (
            <AdiantamentoLucroCard
              valorCentavos={resumo.disponivelFimMesCentavos}
              disponivelHojeCentavos={resumo.disponivelHojeCentavos}
              reservaCentavos={resumo.reservaAteProximoRecebimentoCentavos}
              margemCentavos={margemSegurancaCentavos}
              horizonte={horizonteReserva}
            />
          )}
          <ResumoCaixaCards
            itens={[
              {
                label: "Entradas do mês",
                valorCentavos: totalReceitas,
                hint: `${formatCentavos(somaPor(receitas, true))} confirmados · ${formatCentavos(somaPor(receitas, false))} pendentes`,
                tone: "positive",
              },
              {
                label: "Saídas do mês",
                valorCentavos: totalDespesas,
                hint: `${formatCentavos(somaPor(despesas, true))} confirmados · ${formatCentavos(somaPor(despesas, false))} pendentes`,
                tone: "negative",
              },
              {
                label:
                  mes === mesAtual() ? "Saldo atual" : "Resultado confirmado",
                valorCentavos:
                  mes === mesAtual()
                    ? saldoAtualCentavos
                    : somaPor(receitas, true) - somaPor(despesas, true),
                hint:
                  mes === mesAtual()
                    ? "Somente movimentações confirmadas"
                    : "Entradas recebidas menos saídas pagas",
                tone:
                  (mes === mesAtual()
                    ? saldoAtualCentavos
                    : somaPor(receitas, true) - somaPor(despesas, true)) >= 0
                    ? "positive"
                    : "negative",
              },
              {
                label:
                  mes === mesAtual()
                    ? "Saldo no fim do mês"
                    : "Resultado pendente",
                valorCentavos:
                  mes === mesAtual()
                    ? resumo.saldoProjetadoFimMesCentavos
                    : somaPor(receitas, false) - somaPor(despesas, false),
                hint:
                  mes === mesAtual()
                    ? "Se todas as previsões se confirmarem"
                    : "Entradas previstas menos saídas pendentes",
                tone:
                  (mes === mesAtual()
                    ? resumo.saldoProjetadoFimMesCentavos
                    : somaPor(receitas, false) - somaPor(despesas, false)) >= 0
                    ? "positive"
                    : "negative",
              },
            ]}
          />
        </>
      )}

      {isLoading ? (
        <ControleSecaoSkeleton />
      ) : (
        <Tabs defaultValue="pagar" className="gap-4">
          <TabsList
            variant="line"
            className="w-full justify-start gap-2 border-b border-border px-1 group-data-horizontal/tabs:h-auto sm:gap-6"
          >
            <TabsTrigger
              value="pagar"
              className="h-10 gap-2 px-2 py-2 after:bottom-[-1px] after:bg-primary sm:min-w-36 sm:flex-none"
            >
              A pagar
              <span className="rounded-full bg-negative/10 px-2 py-0.5 text-xs tabular-nums text-negative">
                {despesas.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="receber"
              className="h-10 gap-2 px-2 py-2 after:bottom-[-1px] after:bg-primary sm:min-w-36 sm:flex-none"
            >
              A receber
              <span className="rounded-full bg-positive/10 px-2 py-0.5 text-xs tabular-nums text-positive">
                {receitas.length}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pagar">
            <ControleSecao
              titulo="A pagar"
              itens={despesas}
              tone="negative"
              totalConfirmado={somaPor(despesas, true)}
              totalPendente={somaPor(despesas, false)}
              emptyLabel="Nenhuma despesa prevista para este mês."
            />
          </TabsContent>
          <TabsContent value="receber">
            <ControleSecao
              titulo="A receber"
              itens={receitas}
              tone="positive"
              totalConfirmado={somaPor(receitas, true)}
              totalPendente={somaPor(receitas, false)}
              emptyLabel="Nenhuma receita prevista para este mês."
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
