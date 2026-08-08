export type MovimentoProjetado = {
  data: Date;
  tipo: "despesa" | "receita";
  valorCentavos: number;
};

function chaveDia(data: Date) {
  return data.toISOString().slice(0, 10);
}

function variacao(movimento: MovimentoProjetado) {
  return movimento.tipo === "receita"
    ? movimento.valorCentavos
    : -movimento.valorCentavos;
}

/** Menor saldo ao percorrer os movimentos, agrupando entradas e saídas do mesmo dia. */
export function calcularMenorSaldoProjetado(
  saldoInicialCentavos: number,
  movimentos: MovimentoProjetado[],
) {
  const variacoesPorDia = new Map<string, number>();

  for (const movimento of movimentos) {
    const dia = chaveDia(movimento.data);
    variacoesPorDia.set(
      dia,
      (variacoesPorDia.get(dia) ?? 0) + variacao(movimento),
    );
  }

  let saldo = saldoInicialCentavos;
  let menorSaldo = saldoInicialCentavos;

  for (const [, variacaoDoDia] of [...variacoesPorDia.entries()].sort(
    ([a], [b]) => a.localeCompare(b),
  )) {
    saldo += variacaoDoDia;
    menorSaldo = Math.min(menorSaldo, saldo);
  }

  return menorSaldo;
}

export function calcularResumoCaixa({
  saldoAtualCentavos,
  movimentosPendentesMes,
  movimentosAteProximoRecebimento,
  margemSegurancaCentavos,
}: {
  saldoAtualCentavos: number;
  movimentosPendentesMes: MovimentoProjetado[];
  movimentosAteProximoRecebimento: MovimentoProjetado[];
  margemSegurancaCentavos: number;
}) {
  const entradasPendentesCentavos = movimentosPendentesMes
    .filter((movimento) => movimento.tipo === "receita")
    .reduce((total, movimento) => total + movimento.valorCentavos, 0);
  const saidasPendentesCentavos = movimentosPendentesMes
    .filter((movimento) => movimento.tipo === "despesa")
    .reduce((total, movimento) => total + movimento.valorCentavos, 0);
  const saldoProjetadoFimMesCentavos =
    saldoAtualCentavos + entradasPendentesCentavos - saidasPendentesCentavos;

  const menorSaldoAteProximoRecebimento = calcularMenorSaldoProjetado(
    0,
    movimentosAteProximoRecebimento,
  );
  const reservaAteProximoRecebimentoCentavos = Math.max(
    0,
    -menorSaldoAteProximoRecebimento,
  );

  const menorSaldoNoHorizonte = calcularMenorSaldoProjetado(
    saldoAtualCentavos,
    [...movimentosPendentesMes, ...movimentosAteProximoRecebimento],
  );

  return {
    entradasPendentesCentavos,
    saidasPendentesCentavos,
    saldoProjetadoFimMesCentavos,
    reservaAteProximoRecebimentoCentavos,
    disponivelHojeCentavos: Math.max(
      0,
      menorSaldoNoHorizonte - margemSegurancaCentavos,
    ),
    disponivelFimMesCentavos: Math.max(
      0,
      saldoProjetadoFimMesCentavos -
        reservaAteProximoRecebimentoCentavos -
        margemSegurancaCentavos,
    ),
  };
}
