"use client";

import { MonthPicker } from "@/components/month-picker";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { useMonthFilter } from "@/hooks/use-month-filter";
import { useNotasFiscais, useUpdateNotaFiscal } from "@/hooks/use-notas-fiscais";
import { useSetStatusMensalLancamento, useStatusMensal } from "@/hooks/use-status-mensal";
import { useTransacoes, useUpdateTransacao } from "@/hooks/use-transacoes";
import { dataOcorrenciaLancamentoFixo, statusEfetivoLancamentoFixo } from "@/lib/saldo";
import { CATEGORIA_LABEL } from "@/types/lancamento-fixo";
import { ControleSecao, ControleSecaoSkeleton } from "./_components/controle-secao";
import type { ItemControle } from "./_components/tipos";

function toUtcNoon(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
  );
}

function somaPor(itens: ItemControle[], pago: boolean) {
  return itens
    .filter((i) => i.pago === pago)
    .reduce((sum, i) => sum + i.valorCentavos, 0);
}

export default function ControleMesPage() {
  const { mes } = useMonthFilter();
  const { data: lancamentosFixos, isLoading: isLoadingFixos } = useLancamentosFixos();
  const { data: transacoes, isLoading: isLoadingTransacoes } = useTransacoes();
  const { data: notasFiscais, isLoading: isLoadingNotasFiscais } = useNotasFiscais();
  const { data: statusMensal, isLoading: isLoadingStatus } = useStatusMensal();

  const setStatusFixo = useSetStatusMensalLancamento();
  const updateTransacao = useUpdateTransacao();
  const updateNotaFiscal = useUpdateNotaFiscal();

  const isLoading =
    isLoadingFixos || isLoadingTransacoes || isLoadingNotasFiscais || isLoadingStatus;

  const hoje = new Date();
  const overrides = statusMensal ?? [];

  const itensFixos: ItemControle[] = (lancamentosFixos ?? [])
    .filter((l) => l.ativo)
    .map((lancamento) => {
      const dataOcorrencia = dataOcorrenciaLancamentoFixo(lancamento, mes);
      const pago = statusEfetivoLancamentoFixo({
        lancamentoFixoId: lancamento.id,
        mes,
        dataOcorrencia,
        overrides,
        hoje,
      });

      return {
        key: `fixo-${lancamento.id}`,
        tipo: lancamento.tipo,
        nome: lancamento.nome,
        categoria: CATEGORIA_LABEL[lancamento.categoria],
        dia: dataOcorrencia.getUTCDate(),
        valorCentavos: lancamento.valorCentavos,
        pago,
        onToggle: () =>
          setStatusFixo.mutate({
            lancamentoFixoId: lancamento.id,
            mes,
            pago: !pago,
          }),
        isToggling: setStatusFixo.isPending,
      };
    });

  const itensTransacoes: ItemControle[] = (transacoes ?? [])
    .filter((t) => t.data.toISOString().slice(0, 7) === mes)
    .map((transacao) => ({
      key: `transacao-${transacao.id}`,
      tipo: transacao.tipo,
      nome: transacao.nome,
      categoria: CATEGORIA_LABEL[transacao.categoria],
      dia: transacao.data.getUTCDate(),
      valorCentavos: transacao.valorCentavos,
      pago: transacao.pago,
      onToggle: () =>
        updateTransacao.mutate({
          id: transacao.id,
          input: { pago: !transacao.pago },
        }),
      isToggling: updateTransacao.isPending,
    }));

  const itensNotasFiscais: ItemControle[] = (notasFiscais ?? [])
    .filter((nf) => {
      const recebimento = nf.dataRecebimentoReal ?? nf.dataRecebimentoPrevista;
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
        dia: recebimento.getUTCDate(),
        valorCentavos: notaFiscal.valorCentavos,
        pago: recebido,
        onToggle: () =>
          updateNotaFiscal.mutate({
            id: notaFiscal.id,
            input: {
              dataRecebimentoReal: recebido ? null : toUtcNoon(new Date()),
            },
          }),
        isToggling: updateNotaFiscal.isPending,
      };
    });

  const despesas = [...itensFixos, ...itensTransacoes]
    .filter((item) => item.tipo === "despesa")
    .sort((a, b) => a.dia - b.dia);
  const receitas = [...itensFixos, ...itensTransacoes, ...itensNotasFiscais]
    .filter((item) => item.tipo === "receita")
    .sort((a, b) => a.dia - b.dia);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Controle do mês</h1>
          <p className="text-sm text-muted-foreground">
            Marque o que já foi pago ou recebido de fato — é isso que entra no
            saldo atual em conta, na Visão geral.
          </p>
        </div>
        <MonthPicker />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ControleSecaoSkeleton />
            <ControleSecaoSkeleton />
          </>
        ) : (
          <>
            <ControleSecao
              titulo="A pagar"
              itens={despesas}
              tone="negative"
              totalConfirmado={somaPor(despesas, true)}
              totalPendente={somaPor(despesas, false)}
              emptyLabel="Nenhuma despesa prevista para este mês."
            />
            <ControleSecao
              titulo="A receber"
              itens={receitas}
              tone="positive"
              totalConfirmado={somaPor(receitas, true)}
              totalPendente={somaPor(receitas, false)}
              emptyLabel="Nenhuma receita prevista para este mês."
            />
          </>
        )}
      </div>
    </div>
  );
}
