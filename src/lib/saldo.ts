import { diasNoMes } from "@/lib/fluxo-mensal";
import {
  valorCaixaLancamentoFixo,
  type LancamentoFixo,
} from "@/types/lancamento-fixo";
import type { NotaFiscal } from "@/types/nota-fiscal";
import type { StatusMensalLancamento } from "@/types/status-mensal";
import type { Transacao } from "@/types/transacao";

function inicioDoDia(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function mesChave(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Último dia do mês anterior a `mes` (formato "YYYY-MM"), à meia-noite UTC. */
function ultimoDiaDoMesAnterior(mes: string) {
  const [ano, mesNum] = mes.split("-").map(Number);
  return new Date(Date.UTC(ano, mesNum - 1, 0));
}

export function dataOcorrenciaLancamentoFixo(
  lancamento: Pick<LancamentoFixo, "diaVencimento">,
  mes: string
): Date {
  const [ano, mesNum] = mes.split("-").map(Number);
  const dia = Math.min(lancamento.diaVencimento, diasNoMes(mes));
  return new Date(Date.UTC(ano, mesNum - 1, dia, 12, 0, 0));
}

/**
 * Status pago/recebido de uma ocorrência mensal de lançamento fixo. Sem
 * confirmação manual, a ocorrência continua pendente. O vencimento sozinho
 * nunca movimenta o saldo real.
 */
export function statusEfetivoLancamentoFixo({
  lancamentoFixoId,
  mes,
  overrides,
}: {
  lancamentoFixoId: string;
  mes: string;
  overrides: StatusMensalLancamento[];
}): boolean {
  const override = overrides.find(
    (o) => o.lancamentoFixoId === lancamentoFixoId && o.mes === mes
  );
  if (override) return override.pago;
  return false;
}

type CalcularSaldoParams = {
  saldoInicialCentavos: number;
  saldoInicialData: Date;
  lancamentosFixos: LancamentoFixo[];
  transacoes: Transacao[];
  notasFiscais: NotaFiscal[];
  statusOverrides: StatusMensalLancamento[];
  /** Só eventos até este dia (inclusive) entram na soma. */
  ateInclusive: Date;
  /** "Agora" real, usado como limite do saldo atual. */
  hoje: Date;
};

function calcularSaldo({
  saldoInicialCentavos,
  saldoInicialData,
  lancamentosFixos,
  transacoes,
  notasFiscais,
  statusOverrides,
  ateInclusive,
}: CalcularSaldoParams): number {
  const inicioExclusivo = inicioDoDia(saldoInicialData);
  const fimInclusivo = inicioDoDia(ateInclusive);
  let saldo = saldoInicialCentavos;

  const dentroDoIntervalo = (data: Date) => {
    const dia = inicioDoDia(data);
    return dia > inicioExclusivo && dia <= fimInclusivo;
  };

  for (const transacao of transacoes) {
    if (!transacao.pago || !dentroDoIntervalo(transacao.data)) continue;
    saldo +=
      transacao.tipo === "receita"
        ? transacao.valorCentavos
        : -transacao.valorCentavos;
  }

  for (const nf of notasFiscais) {
    if (!nf.dataRecebimentoReal || !dentroDoIntervalo(nf.dataRecebimentoReal))
      continue;
    saldo += nf.valorCentavos;
  }

  const lancamentosAtivos = lancamentosFixos.filter((l) => l.ativo);
  if (lancamentosAtivos.length > 0 && fimInclusivo >= inicioExclusivo) {
    for (
      let cursor = new Date(
        Date.UTC(inicioExclusivo.getUTCFullYear(), inicioExclusivo.getUTCMonth(), 1)
      );
      cursor <= fimInclusivo;
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
    ) {
      const mes = mesChave(cursor);
      for (const lancamento of lancamentosAtivos) {
        const dataOcorrencia = dataOcorrenciaLancamentoFixo(lancamento, mes);

        const override = statusOverrides.find(
          (item) =>
            item.lancamentoFixoId === lancamento.id && item.mes === mes
        );
        const pago = statusEfetivoLancamentoFixo({
          lancamentoFixoId: lancamento.id,
          mes,
          overrides: statusOverrides,
        });
        if (!pago) continue;

        const dataEfetiva = override?.dataPagamento ?? dataOcorrencia;
        if (!dentroDoIntervalo(dataEfetiva)) continue;

        const valorCentavos =
          override?.valorRealCentavos ?? valorCaixaLancamentoFixo(lancamento);

        saldo +=
          lancamento.tipo === "receita"
            ? valorCentavos
            : -valorCentavos;
      }
    }
  }

  return saldo;
}

export function calcularSaldoAtual(
  params: Omit<CalcularSaldoParams, "ateInclusive">
): number {
  return calcularSaldo({ ...params, ateInclusive: params.hoje });
}

/** Saldo acumulado até o fim do mês anterior — base pro gráfico de fluxo do mês selecionado. */
export function calcularSaldoBaseParaMes(
  mes: string,
  params: Omit<CalcularSaldoParams, "ateInclusive">
): number {
  return calcularSaldo({ ...params, ateInclusive: ultimoDiaDoMesAnterior(mes) });
}
