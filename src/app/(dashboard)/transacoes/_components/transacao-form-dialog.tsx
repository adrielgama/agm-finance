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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTransacao, useUpdateTransacao } from "@/hooks/use-transacoes";
import { useSocios } from "@/hooks/use-socios";
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
  CATEGORIA_LABEL,
  type TipoLancamento,
} from "@/types/lancamento-fixo";
import type { Transacao, TransacaoInput } from "@/types/transacao";

type FormState = {
  tipo: TipoLancamento;
  nome: string;
  categoria: TransacaoInput["categoria"];
  valorCentavos: number;
  data: Date | undefined;
  pago: boolean;
  responsavelId: string | null;
  observacao: string;
};

const emptyForm: FormState = {
  tipo: "despesa",
  nome: "",
  categoria: "outros",
  valorCentavos: 0,
  data: new Date(),
  pago: true,
  responsavelId: null,
  observacao: "",
};

function toFormState(transacao: Transacao): FormState {
  return {
    tipo: transacao.tipo,
    nome: transacao.nome,
    categoria: transacao.categoria,
    valorCentavos: transacao.valorCentavos,
    data: transacao.data,
    pago: transacao.pago,
    responsavelId: transacao.responsavelId,
    observacao: transacao.observacao ?? "",
  };
}

export function TransacaoFormDialog({
  transacao,
  trigger,
  presetForm,
}: {
  transacao?: Transacao;
  trigger: React.ReactNode;
  /** Pré-preenche a criação (ex.: atalho "Lançar DAS do mês") — valor fica em branco pro usuário completar. */
  presetForm?: Partial<FormState>;
}) {
  const isEditing = Boolean(transacao);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: socios } = useSocios();
  const createTransacao = useCreateTransacao();
  const updateTransacao = useUpdateTransacao();
  const isPending = createTransacao.isPending || updateTransacao.isPending;

  const categorias = form.tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(transacao ? toFormState(transacao) : { ...emptyForm, ...presetForm });
    }
    setOpen(nextOpen);
  }

  function handleTipoChange(tipo: TipoLancamento) {
    const novasCategorias = tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;
    setForm({ ...form, tipo, categoria: novasCategorias[novasCategorias.length - 1] });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.data) return;

    const input: TransacaoInput = {
      tipo: form.tipo,
      nome: form.nome,
      categoria: form.categoria,
      valorCentavos: form.valorCentavos,
      data: form.data,
      pago: form.pago,
      responsavelId: form.responsavelId,
      observacao: form.observacao || null,
    };

    const action = isEditing
      ? updateTransacao.mutateAsync({ id: transacao!.id, input })
      : createTransacao.mutateAsync(input);

    action.then(() => setOpen(false));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar transação" : "Nova transação"}
            </DialogTitle>
            <DialogDescription>
              Itens pontuais — despesas fora do padrão ou aportes de sócio,
              não recorrentes.
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
                placeholder="Ex.: IPTU atrasado, aporte plano de saúde"
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
                <Label htmlFor="data">Data</Label>
                <DatePicker
                  id="data"
                  value={form.data}
                  onValueChange={(data) => setForm({ ...form, data })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="pago">
                  {form.tipo === "despesa" ? "Já foi pago" : "Já foi recebido"}
                </Label>
                <span className="text-xs text-muted-foreground">
                  Desmarque pra lançar algo planejado, ainda não efetivado.
                </span>
              </div>
              <Switch
                id="pago"
                checked={form.pago}
                onCheckedChange={(pago) => setForm({ ...form, pago })}
              />
            </div>

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
