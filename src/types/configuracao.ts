/**
 * Documento único (`configuracoes/geral`) com o saldo real da conta na data
 * em que o app começou a rastrear fluxo de caixa. Serve de base pro saldo
 * atual e pro gráfico de fluxo do mês — sem isso, os dois assumiriam que a
 * conta começou em zero.
 */
export type ConfiguracaoGeral = {
  saldoInicialCentavos: number;
  saldoInicialData: Date;
  margemSegurancaCentavos: number;
  updatedAt: Date;
};

export type ConfiguracaoGeralInput = Omit<ConfiguracaoGeral, "updatedAt">;
