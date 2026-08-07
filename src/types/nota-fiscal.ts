export type NotaFiscal = {
  id: string;
  cliente: string;
  valorCentavos: number;
  /** Mês de competência (a que trabalho a nota se refere), formato "YYYY-MM". */
  mesReferencia: string;
  dataEmissao: Date;
  dataRecebimentoPrevista: Date | null;
  dataRecebimentoReal: Date | null;
  observacao: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NotaFiscalInput = Omit<NotaFiscal, "id" | "createdAt" | "updatedAt">;

export function isNotaFiscalRecebida(nf: Pick<NotaFiscal, "dataRecebimentoReal">) {
  return nf.dataRecebimentoReal !== null;
}
