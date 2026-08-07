"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

function formatCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Extrai só os dígitos do texto e trata a sequência como centavos, tipo caixa eletrônico. */
function digitsToCentavos(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

type CurrencyInputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "defaultValue"
> & {
  defaultValueCentavos: number;
  onValueChange: (centavos: number) => void;
};

/**
 * Input de moeda com máscara: os dígitos digitados preenchem os centavos da
 * direita pra esquerda (ex.: "2","5","0" vira 2,50), igual input de banco.
 * Não controlado por fora — só reflete `defaultValueCentavos` na montagem.
 * Para forçar um novo valor (ex.: botão "usar valor cadastrado"), remonte
 * com uma `key` diferente.
 */
export function CurrencyInput({
  defaultValueCentavos,
  onValueChange,
  ...props
}: CurrencyInputProps) {
  const [centavos, setCentavos] = useState(defaultValueCentavos);

  return (
    <Input
      inputMode="decimal"
      value={formatCentavos(centavos)}
      onChange={(e) => {
        const next = digitsToCentavos(e.target.value);
        setCentavos(next);
        onValueChange(next);
      }}
      {...props}
    />
  );
}
