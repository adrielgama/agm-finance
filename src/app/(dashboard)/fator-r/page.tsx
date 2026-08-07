"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { useNotasFiscais } from "@/hooks/use-notas-fiscais";
import { calcularReceitaAnualPorNotasFiscais } from "@/lib/fator-r";
import { FatorRCalculator } from "./_components/fator-r-calculator";

export default function FatorRPage() {
  const { data: lancamentos, isLoading: isLoadingLancamentos } =
    useLancamentosFixos();
  const { data: notasFiscais, isLoading: isLoadingNotasFiscais } =
    useNotasFiscais();

  const isLoading = isLoadingLancamentos || isLoadingNotasFiscais;

  const { receitaAnualCentavos, mesesConsiderados } =
    calcularReceitaAnualPorNotasFiscais(notasFiscais ?? []);

  const proLaboreMensal = (lancamentos ?? [])
    .filter((l) => l.tipo === "despesa" && l.ativo && l.categoria === "pro_labore")
    .reduce((sum, l) => sum + l.valorCentavos, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fator R</h1>
        <p className="text-sm text-muted-foreground">
          Simule o pró-labore ideal para se manter no Anexo III do Simples
          Nacional (alíquota inicial de 6%).
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="mt-0.5 size-4 shrink-0"
        />
        <span>
          Fator R = folha de pagamento (incluindo pró-labore) dos últimos 12
          meses ÷ receita bruta dos últimos 12 meses. A partir de 28% a
          empresa migra do Anexo V para o Anexo III. A receita sugerida abaixo
          é a média das notas fiscais emitidas nos últimos{" "}
          {mesesConsiderados || 0} mês(es) de histórico, anualizada — não
          prevê mudanças futuras (perda/ganho de cliente). Ajuste manualmente
          se souber que sua receita vai mudar. Esta é uma estimativa para
          planejamento — confirme o enquadramento exato com sua contabilidade.
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <FatorRCalculator
          receitaAnualPadraoCentavos={receitaAnualCentavos}
          proLaboreMensalPadraoCentavos={proLaboreMensal}
        />
      )}
    </div>
  );
}
