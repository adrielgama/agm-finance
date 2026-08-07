import type {
  CategoriaDespesa,
  CategoriaReceita,
  TipoLancamento,
} from "@/types/lancamento-fixo";

/**
 * Movimentação pontual — não recorrente. Cobre tanto despesas extras (ex.:
 * um boleto fora do padrão) quanto entradas variáveis (ex.: aporte de sócio
 * pro plano de saúde). Diferente de `LancamentoFixo`, tem uma data exata em
 * vez de um dia de vencimento recorrente.
 */
export type Transacao = {
  id: string;
  tipo: TipoLancamento;
  nome: string;
  categoria: CategoriaDespesa | CategoriaReceita;
  valorCentavos: number;
  data: Date;
  /** Já efetivada (pago/recebido)? Default true — a maioria é lançada depois de acontecer. */
  pago: boolean;
  responsavelId: string | null;
  observacao: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TransacaoInput = Omit<Transacao, "id" | "createdAt" | "updatedAt">;
