"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonthCalendarPopover } from "@/components/month-calendar-popover";
import {
  useCreateNotaFiscal,
  useUpdateNotaFiscal,
} from "@/hooks/use-notas-fiscais";
import type { NotaFiscal, NotaFiscalInput } from "@/types/nota-fiscal";

type FormState = {
  cliente: string;
  valorCentavos: number;
  mesReferencia: string;
  dataEmissao: Date | undefined;
  dataRecebimentoPrevista: Date | undefined;
  observacao: string;
};

function mesAtual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const emptyForm: FormState = {
  cliente: "",
  valorCentavos: 0,
  mesReferencia: mesAtual(),
  dataEmissao: new Date(),
  dataRecebimentoPrevista: undefined,
  observacao: "",
};

function toFormState(nf: NotaFiscal): FormState {
  return {
    cliente: nf.cliente,
    valorCentavos: nf.valorCentavos,
    mesReferencia: nf.mesReferencia,
    dataEmissao: nf.dataEmissao,
    dataRecebimentoPrevista: nf.dataRecebimentoPrevista ?? undefined,
    observacao: nf.observacao ?? "",
  };
}

export function NotaFiscalFormDialog({
  notaFiscal,
  trigger,
}: {
  notaFiscal?: NotaFiscal;
  trigger: React.ReactNode;
}) {
  const isEditing = Boolean(notaFiscal);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const createNotaFiscal = useCreateNotaFiscal();
  const updateNotaFiscal = useUpdateNotaFiscal();
  const isPending = createNotaFiscal.isPending || updateNotaFiscal.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(notaFiscal ? toFormState(notaFiscal) : emptyForm);
    }
    setOpen(nextOpen);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.dataEmissao) return;

    const input: NotaFiscalInput = {
      cliente: form.cliente,
      valorCentavos: form.valorCentavos,
      mesReferencia: form.mesReferencia,
      dataEmissao: form.dataEmissao,
      dataRecebimentoPrevista: form.dataRecebimentoPrevista ?? null,
      dataRecebimentoReal: notaFiscal?.dataRecebimentoReal ?? null,
      observacao: form.observacao || null,
    };

    const action = isEditing
      ? updateNotaFiscal.mutateAsync({ id: notaFiscal!.id, input })
      : createNotaFiscal.mutateAsync(input);

    action.then(() => setOpen(false));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar nota fiscal" : "Nova nota fiscal"}
            </DialogTitle>
            <DialogDescription>
              Mês de referência é a competência (a que trabalho a nota se
              refere), pode ser diferente do mês de emissão.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                required
                placeholder="Ex.: Estapar"
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <CurrencyInput
                  id="valor"
                  required
                  defaultValueCentavos={form.valorCentavos}
                  onValueChange={(valorCentavos) =>
                    setForm((f) => ({ ...f, valorCentavos }))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mesReferencia">Mês de referência</Label>
                <MonthCalendarPopover
                  id="mesReferencia"
                  variant="full"
                  mes={form.mesReferencia}
                  onMesChange={(mesReferencia) =>
                    setForm({ ...form, mesReferencia })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="dataEmissao">Data de emissão</Label>
                <DatePicker
                  id="dataEmissao"
                  value={form.dataEmissao}
                  onValueChange={(dataEmissao) =>
                    setForm({ ...form, dataEmissao })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="dataRecebimentoPrevista">
                  Previsão de recebimento
                </Label>
                <DatePicker
                  id="dataRecebimentoPrevista"
                  value={form.dataRecebimentoPrevista}
                  onValueChange={(dataRecebimentoPrevista) =>
                    setForm({ ...form, dataRecebimentoPrevista })
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin"
                />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
