"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyInput } from "@/components/currency-input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateLancamentoFixo,
  useUpdateLancamentoFixo,
} from "@/hooks/use-lancamentos-fixos";
import { useSocios } from "@/hooks/use-socios";
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
  CATEGORIA_LABEL,
  type LancamentoFixo,
  type LancamentoFixoInput,
  type TipoLancamento,
} from "@/types/lancamento-fixo";

const emptyForm: LancamentoFixoInput = {
  tipo: "despesa",
  nome: "",
  categoria: "outros",
  valorCentavos: 0,
  valorCaixaCentavos: null,
  diaVencimento: 5,
  responsavelId: null,
  ativo: true,
  observacao: null,
};

export function LancamentoFormDialog({
  lancamento,
  trigger,
}: {
  lancamento?: LancamentoFixo;
  trigger: React.ReactNode;
}) {
  const isEditing = Boolean(lancamento);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LancamentoFixoInput>(emptyForm);

  const { data: socios } = useSocios();
  const createLancamento = useCreateLancamentoFixo();
  const updateLancamento = useUpdateLancamentoFixo();
  const isPending = createLancamento.isPending || updateLancamento.isPending;

  const categorias = form.tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const initial = lancamento
        ? {
            tipo: lancamento.tipo,
            nome: lancamento.nome,
            categoria: lancamento.categoria,
            valorCentavos: lancamento.valorCentavos,
            valorCaixaCentavos: lancamento.valorCaixaCentavos,
            diaVencimento: lancamento.diaVencimento,
            responsavelId: lancamento.responsavelId,
            ativo: lancamento.ativo,
            observacao: lancamento.observacao,
          }
        : emptyForm;

      setForm(initial);
    }
    setOpen(nextOpen);
  }

  function handleTipoChange(tipo: TipoLancamento) {
    const novasCategorias = tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;
    setForm({ ...form, tipo, categoria: novasCategorias[novasCategorias.length - 1] });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const action = isEditing
      ? updateLancamento.mutateAsync({ id: lancamento!.id, input: form })
      : createLancamento.mutateAsync(form);

    action.then(() => setOpen(false));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar lançamento fixo" : "Novo lançamento fixo"}
            </DialogTitle>
            <DialogDescription>
              Itens recorrentes mensais, como contabilidade, plano de saúde ou
              pró-labore.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(value) => handleTipoChange(value as TipoLancamento)}
                >
                  <SelectTrigger id="tipo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(value) =>
                    setForm({ ...form, categoria: value as typeof form.categoria })
                  }
                >
                  <SelectTrigger id="categoria" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {CATEGORIA_LABEL[categoria]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                placeholder="Ex.: Mensalidade contabilidade"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
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
                <Label htmlFor="diaVencimento">Dia de vencimento</Label>
                <Input
                  id="diaVencimento"
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={form.diaVencimento}
                  onChange={(e) =>
                    setForm({ ...form, diaVencimento: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="valor-caixa-diferente">
                  Impacto no caixa diferente do valor bruto
                </Label>
                <span className="text-xs text-muted-foreground">
                  Use para pró-labore líquido ou outro valor com descontos.
                </span>
              </div>
              <Checkbox
                id="valor-caixa-diferente"
                checked={form.valorCaixaCentavos !== null}
                onCheckedChange={(checked) =>
                  setForm({
                    ...form,
                    valorCaixaCentavos:
                      checked === true ? form.valorCentavos : null,
                  })
                }
              />
            </div>

            {form.valorCaixaCentavos !== null && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="valor-caixa">Impacto previsto no caixa (R$)</Label>
                <CurrencyInput
                  id="valor-caixa"
                  defaultValueCentavos={form.valorCaixaCentavos}
                  onValueChange={(valorCaixaCentavos) =>
                    setForm((f) => ({ ...f, valorCaixaCentavos }))
                  }
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="responsavel">Responsável (opcional)</Label>
              <Select
                value={form.responsavelId ?? "none"}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    responsavelId: value === "none" ? null : value,
                  })
                }
              >
                <SelectTrigger id="responsavel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum / empresa</SelectItem>
                  {(socios ?? []).map((socio) => (
                    <SelectItem key={socio.id} value={socio.id}>
                      {socio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                value={form.observacao ?? ""}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value || null })
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.ativo}
                onCheckedChange={(checked) =>
                  setForm({ ...form, ativo: checked === true })
                }
              />
              Ativo
            </label>
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
