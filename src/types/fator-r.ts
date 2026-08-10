export type OrigemFatorR = "contabilidade" | "manual";

export type FatorRCompetencia = {
  id: string;
  competencia: string;
  receitaCentavos: number;
  proLaboreCentavos: number;
  cppCentavos: number;
  outrosFolhaCentavos: number;
  confirmado: boolean;
  origem: OrigemFatorR;
  proLaboreMinimoInformadoCentavos: number | null;
  observacao: string | null;
  updatedAt: Date;
};

export type FatorRCompetenciaInput = Omit<
  FatorRCompetencia,
  "id" | "updatedAt"
>;
