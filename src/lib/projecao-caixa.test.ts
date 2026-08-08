import { describe, expect, test } from "bun:test";
import {
  calcularMenorSaldoProjetado,
  calcularResumoCaixa,
  type MovimentoProjetado,
} from "@/lib/projecao-caixa";

function movimento(
  data: string,
  tipo: MovimentoProjetado["tipo"],
  valorCentavos: number,
): MovimentoProjetado {
  return { data: new Date(`${data}T12:00:00.000Z`), tipo, valorCentavos };
}

describe("projeção de caixa", () => {
  test("reproduz a projeção conciliada de agosto de 2026", () => {
    const resumo = calcularResumoCaixa({
      saldoAtualCentavos: 444_475,
      margemSegurancaCentavos: 100_000,
      movimentosPendentesMes: [
        movimento("2026-08-09", "receita", 284_852),
        movimento("2026-08-09", "receita", 52_890),
        movimento("2026-08-10", "despesa", 436_602),
        movimento("2026-08-10", "despesa", 11_611),
        movimento("2026-08-14", "receita", 1_000_000),
        movimento("2026-08-15", "despesa", 24_900),
        movimento("2026-08-20", "despesa", 105_000),
      ],
      movimentosAteProximoRecebimento: [
        movimento("2026-09-05", "despesa", 99_529),
        movimento("2026-09-09", "receita", 284_852),
        movimento("2026-09-09", "receita", 52_890),
        movimento("2026-09-10", "despesa", 436_602),
        movimento("2026-09-10", "despesa", 11_611),
        movimento("2026-09-15", "despesa", 24_900),
      ],
    });

    expect(resumo.entradasPendentesCentavos).toBe(1_337_742);
    expect(resumo.saidasPendentesCentavos).toBe(578_113);
    expect(resumo.saldoProjetadoFimMesCentavos).toBe(1_204_104);
    expect(resumo.reservaAteProximoRecebimentoCentavos).toBe(234_900);
    expect(resumo.disponivelHojeCentavos).toBe(234_004);
    expect(resumo.disponivelFimMesCentavos).toBe(869_204);
  });

  test("agrega movimentos do mesmo dia antes de avaliar o menor saldo", () => {
    expect(
      calcularMenorSaldoProjetado(100_000, [
        movimento("2026-08-10", "despesa", 150_000),
        movimento("2026-08-10", "receita", 100_000),
      ]),
    ).toBe(50_000);
  });
});
