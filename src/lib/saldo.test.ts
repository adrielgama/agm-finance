import { describe, expect, test } from "bun:test";
import { calcularSaldoAtual } from "@/lib/saldo";
import type { LancamentoFixo } from "@/types/lancamento-fixo";
import type { NotaFiscal } from "@/types/nota-fiscal";
import type { StatusMensalLancamento } from "@/types/status-mensal";
import type { Transacao } from "@/types/transacao";

const data = (dia: number) => new Date(Date.UTC(2026, 7, dia, 12));
const agora = data(7);

const proLabore: LancamentoFixo = {
  id: "pro-labore",
  tipo: "despesa",
  nome: "Pró-labore",
  categoria: "pro_labore",
  valorCentavos: 210_000,
  valorCaixaCentavos: 99_529,
  diaVencimento: 5,
  responsavelId: "adriel",
  ativo: true,
  observacao: null,
  createdAt: agora,
  updatedAt: agora,
};

const statusProLabore: StatusMensalLancamento = {
  id: "pro-labore_2026-08",
  lancamentoFixoId: "pro-labore",
  mes: "2026-08",
  pago: true,
  dataPagamento: data(5),
  valorRealCentavos: 99_529,
  updatedAt: agora,
};

const evob: NotaFiscal = {
  id: "evob",
  cliente: "EVOB",
  valorCentavos: 700_000,
  mesReferencia: "2026-07",
  dataEmissao: data(1),
  dataRecebimentoPrevista: data(5),
  dataRecebimentoReal: data(5),
  observacao: null,
  createdAt: agora,
  updatedAt: agora,
};

const adiantamento: Transacao = {
  id: "adiantamento-agosto",
  tipo: "despesa",
  nome: "Adiantamento de distribuição de lucros",
  categoria: "distribuicao_lucros",
  valorCentavos: 300_000,
  data: data(5),
  pago: true,
  responsavelId: "adriel",
  observacao: null,
  createdAt: agora,
  updatedAt: agora,
};

describe("saldo real", () => {
  test("reconcilia o saldo bancário informado em 07/08/2026", () => {
    expect(
      calcularSaldoAtual({
        saldoInicialCentavos: 144_004,
        saldoInicialData: data(1),
        lancamentosFixos: [proLabore],
        transacoes: [adiantamento],
        notasFiscais: [evob],
        statusOverrides: [statusProLabore],
        hoje: agora,
      })
    ).toBe(444_475);
  });

  test("não movimenta lançamento vencido sem confirmação", () => {
    expect(
      calcularSaldoAtual({
        saldoInicialCentavos: 144_004,
        saldoInicialData: data(1),
        lancamentosFixos: [proLabore],
        transacoes: [],
        notasFiscais: [],
        statusOverrides: [],
        hoje: agora,
      })
    ).toBe(144_004);
  });
});
