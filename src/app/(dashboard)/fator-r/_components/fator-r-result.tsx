import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCentavos } from "@/lib/format";
import { FATOR_R_LIMIAR, type Enquadramento } from "@/lib/fator-r";
import { cn } from "@/lib/utils";

export function FatorRResult({
  fatorR,
  enquadramento,
  proLaboreMinimoMensal,
}: {
  fatorR: number;
  enquadramento: Enquadramento;
  proLaboreMinimoMensal: number;
}) {
  const dentroDoLimiar = enquadramento.anexo === "III";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Fator R</span>
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                dentroDoLimiar ? "text-positive" : "text-negative"
              )}
            >
              {(fatorR * 100).toFixed(1).replace(".", ",")}%
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Enquadramento</span>
            <span className="text-2xl font-semibold">
              Anexo {enquadramento.anexo}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              Alíquota inicial (1ª faixa)
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {enquadramento.aliquotaInicial.toString().replace(".", ",")}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Meta para Anexo III ({(FATOR_R_LIMIAR * 100).toFixed(0)}%)
            </span>
            <span className="tabular-nums text-muted-foreground">
              {(fatorR * 100).toFixed(1).replace(".", ",")}% /{" "}
              {(FATOR_R_LIMIAR * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={Math.min(100, (fatorR / FATOR_R_LIMIAR) * 100)} />
        </div>

        {!dentroDoLimiar && (
          <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm">
            Para ficar no Anexo III mantendo a receita atual, o pró-labore (+
            outros salários) precisaria somar pelo menos{" "}
            <strong className="tabular-nums">
              {formatCentavos(proLaboreMinimoMensal)}
            </strong>{" "}
            por mês.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
