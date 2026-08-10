"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFatorRCompetencias } from "@/hooks/use-fator-r";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { FatorRDashboard } from "./_components/fator-r-dashboard";

export default function FatorRPage() {
  const { data: competencias, isLoading: isLoadingFatorR } =
    useFatorRCompetencias();
  const { data: lancamentos, isLoading: isLoadingLancamentos } =
    useLancamentosFixos();
  const proLaboreAtualCentavos = (lancamentos ?? [])
    .filter(
      (item) =>
        item.tipo === "despesa" &&
        item.ativo &&
        item.categoria === "pro_labore",
    )
    .reduce((total, item) => total + item.valorCentavos, 0);
  const isLoading = isLoadingFatorR || isLoadingLancamentos;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fator R</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe a janela móvel dos últimos 12 meses alinhada com a
          contabilidade.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/[0.055] px-4 py-3 text-sm text-muted-foreground">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <span>
          A receita considera o mês de emissão das notas. A folha considera
          pró-labore bruto, CPP e outros itens aceitos pela contabilidade. O
          valor líquido transferido e o plano de saúde continuam somente no
          fluxo de caixa e não entram neste cálculo.
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
      ) : competencias?.length ? (
        <FatorRDashboard
          competencias={competencias}
          proLaboreAtualCentavos={proLaboreAtualCentavos}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Ainda não há histórico do Fator R cadastrado.
        </div>
      )}
    </div>
  );
}
