"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { IconButton } from "@/components/icon-button";
import { MonthCalendarPopover } from "@/components/month-calendar-popover";
import { useMonthFilter } from "@/hooks/use-month-filter";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function MonthPicker() {
  const { mes, ano, mesNumero, setMes, irParaMesAnterior, irParaProximoMes } =
    useMonthFilter();

  return (
    <div className="flex items-center gap-1">
      <IconButton
        variant="outline"
        tooltip="Mês anterior"
        onClick={irParaMesAnterior}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
      </IconButton>
      <span className="min-w-32 text-center text-sm font-medium">
        {MESES[mesNumero - 1]} {ano}
      </span>
      <IconButton
        variant="outline"
        tooltip="Próximo mês"
        onClick={irParaProximoMes}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
      </IconButton>
      <MonthCalendarPopover mes={mes} onMesChange={setMes} />
    </div>
  );
}
