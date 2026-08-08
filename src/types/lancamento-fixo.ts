export type TipoLancamento = "despesa" | "receita";

export const CATEGORIAS_DESPESA = [
  "contabilidade",
  "plano_saude",
  "pro_labore",
  "emissao_nf",
  "ferramentas",
  "infraestrutura",
  "impostos",
  "distribuicao_lucros",
  "outros",
] as const;

export const CATEGORIAS_RECEITA = [
  "prestacao_servico",
  "aporte_socio",
  "outros",
] as const;

export type CategoriaDespesa = (typeof CATEGORIAS_DESPESA)[number];
export type CategoriaReceita = (typeof CATEGORIAS_RECEITA)[number];

export const CATEGORIA_LABEL: Record<CategoriaDespesa | CategoriaReceita, string> = {
  contabilidade: "Contabilidade",
  plano_saude: "Plano de saúde",
  pro_labore: "Pró-labore",
  emissao_nf: "Emissão de NF",
  ferramentas: "Ferramentas",
  infraestrutura: "Infraestrutura",
  impostos: "Impostos",
  distribuicao_lucros: "Distribuição de lucros",
  prestacao_servico: "Prestação de serviço",
  aporte_socio: "Aporte de sócio",
  outros: "Outros",
};

export type LancamentoFixo = {
  id: string;
  tipo: TipoLancamento;
  nome: string;
  categoria: CategoriaDespesa | CategoriaReceita;
  valorCentavos: number;
  /** Impacto previsto no banco quando for diferente do valor bruto. */
  valorCaixaCentavos: number | null;
  diaVencimento: number;
  responsavelId: string | null;
  ativo: boolean;
  observacao: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LancamentoFixoInput = Omit<
  LancamentoFixo,
  "id" | "createdAt" | "updatedAt"
>;

export function valorCaixaLancamentoFixo(
  lancamento: Pick<LancamentoFixo, "valorCentavos" | "valorCaixaCentavos">
) {
  return lancamento.valorCaixaCentavos ?? lancamento.valorCentavos;
}
