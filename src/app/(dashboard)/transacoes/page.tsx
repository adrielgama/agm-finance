"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, TaxesIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthPicker } from "@/components/month-picker";
import { useMonthFilter } from "@/hooks/use-month-filter";
import { useSocios } from "@/hooks/use-socios";
import { useTransacoes } from "@/hooks/use-transacoes";
import { formatMesReferencia } from "@/lib/format";
import { TransacaoFormDialog } from "./_components/transacao-form-dialog";
import {
  TransacoesTable,
  TransacoesTableSkeleton,
} from "./_components/transacoes-table";

/** DAS paga no mês M é sempre da competência M-1 (vence dia 20). */
function mesCompetenciaAnterior(mes: string) {
  const [ano, mesNumero] = mes.split("-").map(Number);
  const data = new Date(ano, mesNumero - 2, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export default function TransacoesPage() {
  const { mes } = useMonthFilter();
  const { data: transacoes, isLoading } = useTransacoes();
  const { data: socios } = useSocios();

  const doMes = (transacoes ?? []).filter(
    (t) => t.data.toISOString().slice(0, 7) === mes
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Movimentações pontuais — despesas extras e aportes de sócio, fora
            do padrão recorrente.
          </p>
        </div>
        <div className="flex gap-2">
          <TransacaoFormDialog
            presetForm={{
              tipo: "despesa",
              categoria: "impostos",
              nome: `DAS ${formatMesReferencia(mesCompetenciaAnterior(mes))}`,
              observacao:
                "DAS vence dia 20 — competência é sempre o mês anterior ao pagamento.",
            }}
            trigger={
              <Button variant="outline">
                <HugeiconsIcon icon={TaxesIcon} className="size-4" />
                Lançar DAS do mês
              </Button>
            }
          />
          <TransacaoFormDialog
            trigger={
              <Button>
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
                Nova transação
              </Button>
            }
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Transações do mês</CardTitle>
          <MonthPicker />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TransacoesTableSkeleton />
          ) : (
            <TransacoesTable transacoes={doMes} socios={socios ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
