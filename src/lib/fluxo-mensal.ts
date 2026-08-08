import {
  valorCaixaLancamentoFixo,
  type LancamentoFixo,
} from "@/types/lancamento-fixo";
import type { NotaFiscal } from "@/types/nota-fiscal";
import type { Transacao } from "@/types/transacao";

export type EventoFluxo = {
  dia: number;
  tipo: "despesa" | "receita";
  nome: string;
  valorCentavos: number;
  origem: "fixo" | "transacao" | "nota-fiscal";
};

export function diasNoMes(mes: string) {
  const [ano, mesNum] = mes.split("-").map(Number);
  return new Date(ano, mesNum, 0).getDate();
}

export function calcularEventosFluxo({
  mes,
  lancamentosFixos,
  transacoesDoMes,
  notasFiscais,
}: {
  mes: string;
  lancamentosFixos: LancamentoFixo[];
  transacoesDoMes: Transacao[];
  notasFiscais: NotaFiscal[];
}): EventoFluxo[] {
  const totalDiasNoMes = diasNoMes(mes);
  const eventos: EventoFluxo[] = [];

  for (const lancamento of lancamentosFixos) {
    if (!lancamento.ativo) continue;
    eventos.push({
      dia: Math.min(lancamento.diaVencimento, totalDiasNoMes),
      tipo: lancamento.tipo,
      nome: lancamento.nome,
      valorCentavos: valorCaixaLancamentoFixo(lancamento),
      origem: "fixo",
    });
  }

  for (const transacao of transacoesDoMes) {
    eventos.push({
      dia: transacao.data.getUTCDate(),
      tipo: transacao.tipo,
      nome: transacao.nome,
      valorCentavos: transacao.valorCentavos,
      origem: "transacao",
    });
  }

  for (const notaFiscal of notasFiscais) {
    const recebimento =
      notaFiscal.dataRecebimentoReal ?? notaFiscal.dataRecebimentoPrevista;
    if (!recebimento) continue;

    const chave = `${recebimento.getUTCFullYear()}-${String(
      recebimento.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    if (chave !== mes) continue;

    eventos.push({
      dia: recebimento.getUTCDate(),
      tipo: "receita",
      nome: `NF ${notaFiscal.cliente}`,
      valorCentavos: notaFiscal.valorCentavos,
      origem: "nota-fiscal",
    });
  }

  return eventos.sort((a, b) => a.dia - b.dia);
}

export function calcularSaldoDiario(
  eventos: EventoFluxo[],
  totalDiasNoMes: number,
  saldoBaseCentavos = 0
) {
  const variacaoPorDia = new Array<number>(totalDiasNoMes + 1).fill(0);

  for (const evento of eventos) {
    variacaoPorDia[evento.dia] +=
      evento.tipo === "receita" ? evento.valorCentavos : -evento.valorCentavos;
  }

  let saldoCentavos = saldoBaseCentavos;
  const pontos: { dia: number; saldoCentavos: number }[] = [];

  for (let dia = 1; dia <= totalDiasNoMes; dia++) {
    saldoCentavos += variacaoPorDia[dia];
    pontos.push({ dia, saldoCentavos });
  }

  return pontos;
}

export function calcularReservaMinima(pontos: { saldoCentavos: number }[]) {
  const minimo = Math.min(0, ...pontos.map((p) => p.saldoCentavos));
  return Math.abs(minimo);
}
