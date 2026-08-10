import { describe, expect, test } from "bun:test";
import {
  calcularProLaboreMinimoDaUltimaCompetencia,
  calcularResumoFatorR,
  projetarProximaCompetencia,
} from "@/lib/fator-r";
import type { FatorRCompetencia } from "@/types/fator-r";

function competencia(
  competencia: string,
  receitaCentavos: number,
  proLaboreCentavos: number,
  cppCentavos: number,
): FatorRCompetencia {
  return {
    id: competencia,
    competencia,
    receitaCentavos,
    proLaboreCentavos,
    cppCentavos,
    outrosFolhaCentavos: 0,
    confirmado: true,
    origem: "contabilidade",
    proLaboreMinimoInformadoCentavos: null,
    observacao: null,
    updatedAt: new Date(0),
  };
}

const historicoContabilidade = [
  competencia("2025-09", 0, 0, 0),
  competencia("2025-10", 0, 151_800, 0),
  competencia("2025-11", 456_452, 151_800, 11_886),
  competencia("2025-12", 700_000, 196_000, 18_228),
  competencia("2026-01", 700_000, 196_000, 18_228),
  competencia("2026-02", 700_000, 210_000, 18_228),
  competencia("2026-03", 700_000, 210_000, 18_228),
  competencia("2026-04", 700_000, 210_000, 18_228),
  competencia("2026-05", 700_000, 350_000, 18_228),
  competencia("2026-06", 700_000, 210_000, 18_228),
  competencia("2026-07", 1_750_000, 210_000, 45_570),
];

describe("Fator R por janela móvel", () => {
  test("reproduz os totais informados pela contabilidade até julho", () => {
    const resumo = calcularResumoFatorR(historicoContabilidade);
    expect(resumo.receitaCentavos).toBe(7_106_452);
    expect(resumo.folhaCentavos).toBe(2_280_652);
  });

  test("mantém agosto no Anexo III com pró-labore bruto de R$ 2.100", () => {
    const agosto = competencia("2026-08", 1_700_000, 210_000, 0);
    const dados = [...historicoContabilidade, agosto];
    const resumo = calcularResumoFatorR(dados);

    expect(resumo.receitaCentavos).toBe(8_806_452);
    expect(resumo.folhaCentavos).toBe(2_490_652);
    expect(resumo.fatorR).toBeCloseTo(0.28282128, 7);
    expect(resumo.enquadramento.anexo).toBe("III");
    expect(calcularProLaboreMinimoDaUltimaCompetencia(dados)).toBe(185_155);
  });

  test("projeta setembro com receita de R$ 10 mil sem inventar CPP", () => {
    const agosto = competencia("2026-08", 1_700_000, 210_000, 0);
    const projecao = projetarProximaCompetencia({
      competencias: [...historicoContabilidade, agosto],
      competencia: "2026-09",
      receitaCentavos: 1_000_000,
      proLaboreCentavos: 210_000,
    });

    expect(projecao.resumo.receitaCentavos).toBe(9_806_452);
    expect(projecao.resumo.folhaCentavos).toBe(2_700_652);
    expect(projecao.proLaboreMinimoCentavos).toBe(255_155);
    expect(projecao.resumo.enquadramento.anexo).toBe("V");
  });
});
