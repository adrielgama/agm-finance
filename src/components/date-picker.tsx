"use client";

import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function toUtcNoon(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
  );
}

export function DatePicker({
  id,
  value,
  onValueChange,
  placeholder = "Selecione uma data",
}: {
  id?: string;
  value: Date | undefined;
  onValueChange: (date: Date | undefined) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <HugeiconsIcon icon={Calendar03Icon} className="size-4 shrink-0" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          onSelect={(date) => {
            onValueChange(date ? toUtcNoon(date) : undefined);
            setOpen(false);
          }}
          locale={ptBR}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
