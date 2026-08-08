"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { CurrencyInput } from "@/components/currency-input";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ItemControle } from "./tipos";

export function ConfirmarMovimentoDialog({ item }: { item: ItemControle }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Date | undefined>(item.data);
  const [valorCentavos, setValorCentavos] = useState(item.valorCentavos);

  function handleCheckedChange(checked: boolean) {
    if (!checked) {
      item.onUnconfirm();
      return;
    }

    setData(new Date());
    setValorCentavos(item.valorCentavos);
    setOpen(true);
  }

  function handleConfirm() {
    if (!data) return;
    item.onConfirm(data, valorCentavos);
    setOpen(false);
  }

  return (
    <>
      <Switch
        checked={item.pago}
        disabled={item.isToggling}
        onCheckedChange={handleCheckedChange}
        aria-label={
          item.pago
            ? `Marcar ${item.nome} como pendente`
            : `Confirmar ${item.nome}`
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar movimentação</DialogTitle>
            <DialogDescription>
              Informe quando e quanto realmente movimentou a conta. O saldo
              atual só considera valores confirmados.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`data-${item.key}`}>Data efetiva</Label>
              <DatePicker
                id={`data-${item.key}`}
                value={data}
                onValueChange={setData}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`valor-${item.key}`}>Valor efetivo (R$)</Label>
              <CurrencyInput
                key={`${item.key}-${open ? "open" : "closed"}`}
                id={`valor-${item.key}`}
                defaultValueCentavos={valorCentavos}
                onValueChange={setValorCentavos}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!data || item.isToggling}>
              {item.isToggling && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin"
                />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
