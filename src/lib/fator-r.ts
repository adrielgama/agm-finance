import type { NotaFiscal } from "@/types/nota-fiscal";

export const FATOR_R_LIMIAR = 0.28;

/**
 * Receita anual sugerida a partir do histórico real de notas fiscais: soma
 * os últimos até 12 meses de competência com nota emitida e anualiza pela
 * média mensal. Não tenta prever mudanças futuras (ex.: perda de cliente) —
 * ajuste manualmente o campo no simulador se souber que a receita vai mudar.
 */
export function calcularReceitaAnualPorNotasFiscais(notasFiscais: NotaFiscal[]) {
  const totalPorMes = new Map<string, number>();

  for (const notaFiscal of notasFiscais) {
    totalPorMes.set(
      notaFiscal.mesReferencia,
      (totalPorMes.get(notaFiscal.mesReferencia) ?? 0) + notaFiscal.valorCentavos
    );
  }

  const mesesConsiderados = [...totalPorMes.keys()].sort().slice(-12);

  if (mesesConsiderados.length === 0) {
    return { receitaAnualCentavos: 0, mesesConsiderados: 0 };
  }

  const totalCentavos = mesesConsiderados.reduce(
    (soma, mes) => soma + (totalPorMes.get(mes) ?? 0),
    0
  );
  const mediaMensalCentavos = totalCentavos / mesesConsiderados.length;

  return {
    receitaAnualCentavos: Math.round(mediaMensalCentavos * 12),
    mesesConsiderados: mesesConsiderados.length,
  };
}

export function calcularFolhaAnualCentavos({
  proLaboreMensalCentavos,
  outrosSalariosMensalCentavos,
  encargosPercent,
}: {
  proLaboreMensalCentavos: number;
  outrosSalariosMensalCentavos: number;
  encargosPercent: number;
}) {
  const baseAnual = (proLaboreMensalCentavos + outrosSalariosMensalCentavos) * 12;
  return Math.round(baseAnual * (1 + encargosPercent / 100));
}

export function calcularFatorR({
  folhaAnualCentavos,
  receitaAnualCentavos,
}: {
  folhaAnualCentavos: number;
  receitaAnualCentavos: number;
}) {
  if (receitaAnualCentavos <= 0) return 0;
  return folhaAnualCentavos / receitaAnualCentavos;
}

export function calcularProLaboreMinimoMensal({
  receitaAnualCentavos,
  outrosSalariosMensalCentavos,
  encargosPercent,
  metaFatorR = FATOR_R_LIMIAR,
}: {
  receitaAnualCentavos: number;
  outrosSalariosMensalCentavos: number;
  encargosPercent: number;
  metaFatorR?: number;
}) {
  const fatorEncargos = 1 + encargosPercent / 100;
  const necessarioMensalTotal =
    (metaFatorR * receitaAnualCentavos) / (12 * fatorEncargos);
  return Math.max(0, Math.round(necessarioMensalTotal - outrosSalariosMensalCentavos));
}

export type Enquadramento = {
  anexo: "III" | "V";
  aliquotaInicial: number;
};

export function calcularEnquadramento(fatorR: number): Enquadramento {
  return fatorR >= FATOR_R_LIMIAR
    ? { anexo: "III", aliquotaInicial: 6 }
    : { anexo: "V", aliquotaInicial: 15.5 };
}
