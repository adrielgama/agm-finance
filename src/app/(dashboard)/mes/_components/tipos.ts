export type ItemControle = {
  key: string;
  tipo: "despesa" | "receita";
  nome: string;
  categoria: string;
  data: Date;
  valorCentavos: number;
  pago: boolean;
  onConfirm: (data: Date, valorCentavos: number) => void;
  onUnconfirm: () => void;
  isToggling: boolean;
};
