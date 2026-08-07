"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BankIcon, Edit02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipWrap } from "@/components/tooltip-wrap";
import { useConfiguracao, useUpdateSaldoInicial } from "@/hooks/use-configuracao";
import { formatCentavos, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SaldoAtualCard({
  saldoAtualCentavos,
  isLoading,
}: {
  saldoAtualCentavos: number;
  isLoading: boolean;
}) {
  const { data: configuracao } = useConfiguracao();
  const [open, setOpen] = useState(false);
  const [valorCentavos, setValorCentavos] = useState(0);
  const [data, setData] = useState<Date | undefined>(new Date());
  const updateSaldoInicial = useUpdateSaldoInicial();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValorCentavos(configuracao?.saldoInicialCentavos ?? 0);
      setData(configuracao?.saldoInicialData ?? new Date());
    }
    setOpen(nextOpen);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!data) return;

    updateSaldoInicial
      .mutateAsync({ saldoInicialCentavos: valorCentavos, saldoInicialData: data })
      .then(() => setOpen(false));
  }

  return (
    <Card className="gap-3 py-5">
      <CardContent className="flex items-start justify-between px-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            Saldo atual em conta
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {isLoading ? "—" : formatCentavos(saldoAtualCentavos)}
          </span>
          <span className="text-xs text-muted-foreground">
            {configuracao
              ? `Base: ${formatCentavos(configuracao.saldoInicialCentavos)} em ${formatDate(configuracao.saldoInicialData)}`
              : "Defina o saldo inicial para calcular"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <TooltipWrap tooltip="Editar saldo inicial">
              <DialogTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                    <span className="sr-only">Editar saldo inicial</span>
                  </Button>
                </TooltipTrigger>
              </DialogTrigger>
            </TooltipWrap>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Saldo inicial</DialogTitle>
                  <DialogDescription>
                    Saldo real da conta numa data de referência. O saldo atual
                    é calculado a partir daqui, somando tudo que foi marcado
                    como pago/recebido desde então (ver Controle do mês).
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="saldo-inicial-valor">Saldo (R$)</Label>
                    <CurrencyInput
                      id="saldo-inicial-valor"
                      defaultValueCentavos={valorCentavos}
                      onValueChange={setValorCentavos}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="saldo-inicial-data">Na data de</Label>
                    <DatePicker
                      id="saldo-inicial-data"
                      value={data}
                      onValueChange={setData}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={updateSaldoInicial.isPending}>
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              saldoAtualCentavos >= 0
                ? "bg-positive/10 text-positive"
                : "bg-negative/10 text-negative"
            )}
          >
            <HugeiconsIcon icon={BankIcon} className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
