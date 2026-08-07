"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCentavos } from "@/lib/format";
import {
  calcularEnquadramento,
  calcularFatorR,
  calcularFolhaAnualCentavos,
  calcularProLaboreMinimoMensal,
} from "@/lib/fator-r";
import { FatorRResult } from "./fator-r-result";

export function FatorRCalculator({
  receitaAnualPadraoCentavos,
  proLaboreMensalPadraoCentavos,
}: {
  receitaAnualPadraoCentavos: number;
  proLaboreMensalPadraoCentavos: number;
}) {
  const [receitaAnualCentavos, setReceitaAnualCentavos] = useState(
    receitaAnualPadraoCentavos
  );
  const [proLaboreMensalCentavos, setProLaboreMensalCentavos] = useState(
    proLaboreMensalPadraoCentavos
  );
  const [outrosSalariosMensalCentavos, setOutrosSalariosMensalCentavos] =
    useState(0);
  const [encargosPercent, setEncargosPercent] = useState(0);

  const folhaAnualCentavos = calcularFolhaAnualCentavos({
    proLaboreMensalCentavos,
    outrosSalariosMensalCentavos,
    encargosPercent,
  });
  const fatorR = calcularFatorR({ folhaAnualCentavos, receitaAnualCentavos });
  const enquadramento = calcularEnquadramento(fatorR);
  const proLaboreMinimoMensal = calcularProLaboreMinimoMensal({
    receitaAnualCentavos,
    outrosSalariosMensalCentavos,
    encargosPercent,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="receitaAnual">Receita bruta anual (R$)</Label>
            <CurrencyInput
              id="receitaAnual"
              defaultValueCentavos={receitaAnualCentavos}
              onValueChange={setReceitaAnualCentavos}
            />
            <span className="text-xs text-muted-foreground">
              Sugerido a partir da média das notas fiscais emitidas × 12:{" "}
              {formatCentavos(receitaAnualPadraoCentavos)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="proLabore">Pró-labore mensal (R$)</Label>
            <CurrencyInput
              id="proLabore"
              defaultValueCentavos={proLaboreMensalCentavos}
              onValueChange={setProLaboreMensalCentavos}
            />
            <span className="text-xs text-muted-foreground">
              Cadastrado hoje em Lançamentos fixos:{" "}
              {formatCentavos(proLaboreMensalPadraoCentavos)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="outrosSalarios">
              Outros salários mensais (opcional)
            </Label>
            <CurrencyInput
              id="outrosSalarios"
              defaultValueCentavos={outrosSalariosMensalCentavos}
              onValueChange={setOutrosSalariosMensalCentavos}
            />
            <span className="text-xs text-muted-foreground">
              Funcionários CLT, se houver.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="encargos">Encargos sobre a folha (%)</Label>
            <Input
              id="encargos"
              type="number"
              min={0}
              step="0.1"
              value={encargosPercent}
              onChange={(e) => setEncargosPercent(Number(e.target.value) || 0)}
            />
            <span className="text-xs text-muted-foreground">
              FGTS, 13º, férias — ajuste com sua contabilidade se ela considerar
              esses encargos no Fator R.
            </span>
          </div>
        </CardContent>
      </Card>

      <FatorRResult
        fatorR={fatorR}
        enquadramento={enquadramento}
        proLaboreMinimoMensal={proLaboreMinimoMensal}
      />
    </div>
  );
}
