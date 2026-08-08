/**
 * Override do status pago/recebido de um `LancamentoFixo` num mês específico
 * — o template em si é único e recorrente, então o status precisa ser por
 * ocorrência mensal. Sem confirmação explícita, a ocorrência fica pendente.
 */
export type StatusMensalLancamento = {
  id: string;
  lancamentoFixoId: string;
  mes: string;
  pago: boolean;
  dataPagamento: Date | null;
  /** Impacto real no banco, quando diferente do valor previsto do template. */
  valorRealCentavos: number | null;
  updatedAt: Date;
};
