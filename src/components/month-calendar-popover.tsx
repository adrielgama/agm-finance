"use client";

import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatMesReferencia } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Seletor de mês via calendário: qualquer dia clicado só serve pra indicar o
 * mês/ano (o dia em si é ignorado). `variant="icon"` é compacto, pra barras
 * de filtro (par com setas de navegação); `variant="full"` mostra o mês por
 * extenso no próprio botão, pra campos de formulário.
 */
export function MonthCalendarPopover({
  mes,
  onMesChange,
  variant = "icon",
  id,
}: {
  mes: string;
  onMesChange: (mes: string) => void;
  variant?: "icon" | "full";
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [ano, mesNumero] = mes.split("-").map(Number);
  const mesAtual = new Date(ano, mesNumero - 1, 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "icon" ? (
          <Button type="button" variant="outline" size="icon">
            <HugeiconsIcon icon={Calendar03Icon} className="size-4" />
            <span className="sr-only">Escolher mês no calendário</span>
          </Button>
        ) : (
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn("w-full justify-start gap-2 font-normal")}
          >
            <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0" />
            {formatMesReferencia(mes)}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={mesAtual}
          defaultMonth={mesAtual}
          onSelect={(date) => {
            if (!date) return;
            onMesChange(
              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            );
            setOpen(false);
          }}
          locale={ptBR}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
