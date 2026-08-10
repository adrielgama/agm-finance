import type { FatorRCompetencia } from "@/types/fator-r";

export const FATOR_R_LIMIAR = 0.28;

export type Enquadramento = {
  anexo: "III" | "V";
  aliquotaInicial: number;
};

export function calcularEnquadramento(fatorR: number): Enquadramento {
  return fatorR >= FATOR_R_LIMIAR
    ? { anexo: "III", aliquotaInicial: 6 }
    : { anexo: "V", aliquotaInicial: 15.5 };
}
export function totalFolhaCompetencia(
  competencia: Pick<
    FatorRCompetencia,
    "proLaboreCentavos" | "cppCentavos" | "outrosFolhaCentavos"
  >,
) {
  return (
    competencia.proLaboreCentavos +
    competencia.cppCentavos +
    competencia.outrosFolhaCentavos
  );
}

export function calcularResumoFatorR(competencias: FatorRCompetencia[]) {
  const janela = [...competencias]
    .sort((a, b) => a.competencia.localeCompare(b.competencia))
    .slice(-12);
  const receitaCentavos = janela.reduce(
    (total, item) => total + item.receitaCentavos,
    0,
  );
  const folhaCentavos = janela.reduce(
    (total, item) => total + totalFolhaCompetencia(item),
    0,
  );
  const metaFolhaCentavos = Math.ceil(receitaCentavos * FATOR_R_LIMIAR);
  const fatorR = receitaCentavos > 0 ? folhaCentavos / receitaCentavos : 0;

  return {
    janela,
    receitaCentavos,
    folhaCentavos,
    metaFolhaCentavos,
    margemCentavos: folhaCentavos - metaFolhaCentavos,
    fatorR,
    enquadramento: calcularEnquadramento(fatorR),
  };
}

export function calcularProLaboreMinimoDaUltimaCompetencia(
  competencias: FatorRCompetencia[],
) {
  const resumo = calcularResumoFatorR(competencias);
  const ultima = resumo.janela.at(-1);
  if (!ultima) return 0;

  const folhaSemProLaboreAtual =
    resumo.folhaCentavos - ultima.proLaboreCentavos;
  return Math.max(0, resumo.metaFolhaCentavos - folhaSemProLaboreAtual);
}

export function projetarProximaCompetencia({
  competencias,
  competencia,
  receitaCentavos,
  proLaboreCentavos,
  cppCentavos = 0,
  outrosFolhaCentavos = 0,
}: {
  competencias: FatorRCompetencia[];
  competencia: string;
  receitaCentavos: number;
  proLaboreCentavos: number;
  cppCentavos?: number;
  outrosFolhaCentavos?: number;
}) {
  const projecao: FatorRCompetencia = {
    id: competencia,
    competencia,
    receitaCentavos,
    proLaboreCentavos,
    cppCentavos,
    outrosFolhaCentavos,
    confirmado: false,
    origem: "manual",
    proLaboreMinimoInformadoCentavos: null,
    observacao: null,
    updatedAt: new Date(0),
  };
  const janelaProjetada = [...competencias, projecao]
    .sort((a, b) => a.competencia.localeCompare(b.competencia))
    .slice(-12);

  return {
    resumo: calcularResumoFatorR(janelaProjetada),
    proLaboreMinimoCentavos:
      calcularProLaboreMinimoDaUltimaCompetencia(janelaProjetada),
  };
}
