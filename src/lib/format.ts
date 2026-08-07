const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCentavos(centavos: number) {
  return currencyFormatter.format(centavos / 100);
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

const MESES_ABREVIADOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-07" -> "jul/2026" */
export function formatMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  return `${MESES_ABREVIADOS[mes - 1]}/${ano}`;
}
