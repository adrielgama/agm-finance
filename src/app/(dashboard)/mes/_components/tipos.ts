export type ItemControle = {
  key: string;
  tipo: "despesa" | "receita";
  nome: string;
  categoria: string;
  dia: number;
  valorCentavos: number;
  pago: boolean;
  onToggle: () => void;
  isToggling: boolean;
};
