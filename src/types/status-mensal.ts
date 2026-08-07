/**
 * Override do status pago/recebido de um `LancamentoFixo` num mês específico
 * — o template em si é único e recorrente, então o status precisa ser por
 * ocorrência mensal. Sem override, o status efetivo é inferido pela data de
 * vencimento (ver `statusEfetivo` em `src/lib/saldo.ts`): vencimento no
 * passado conta como pago, hoje/futuro conta como pendente.
 */
export type StatusMensalLancamento = {
  id: string;
  lancamentoFixoId: string;
  mes: string;
  pago: boolean;
  dataPagamento: Date | null;
  updatedAt: Date;
};
