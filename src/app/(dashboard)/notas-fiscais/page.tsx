"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/month-picker";
import { useMonthFilter } from "@/hooks/use-month-filter";
import { useNotasFiscais } from "@/hooks/use-notas-fiscais";
import { formatCentavos } from "@/lib/format";
import { NotaFiscalFormDialog } from "./_components/nota-fiscal-form-dialog";
import {
  NotasFiscaisTable,
  NotasFiscaisTableSkeleton,
} from "./_components/notas-fiscais-table";

export default function NotasFiscaisPage() {
  const { mes } = useMonthFilter();
  const { data: notasFiscais, isLoading } = useNotasFiscais();

  const doMes = (notasFiscais ?? []).filter((nf) => nf.mesReferencia === mes);
  const totalDoMes = doMes.reduce((sum, nf) => sum + nf.valorCentavos, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Notas fiscais</h1>
          <p className="text-sm text-muted-foreground">
            Receita real por competência — o que foi de fato emitido pra cada
            cliente.
          </p>
        </div>
        <NotaFiscalFormDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              Nova nota fiscal
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Notas do mês</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">{formatCentavos(totalDoMes)}</span>
            </span>
            <MonthPicker />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <NotasFiscaisTableSkeleton />
          ) : (
            <NotasFiscaisTable notasFiscais={doMes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
