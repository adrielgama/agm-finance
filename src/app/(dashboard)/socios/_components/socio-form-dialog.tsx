"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreateSocio, useUpdateSocio } from "@/hooks/use-socios";
import type { PapelSocio, Socio, SocioInput } from "@/types/socio";

const emptyForm: SocioInput = {
  nome: "",
  email: "",
  papel: "socio",
  ativo: true,
  participaPlanoSaude: true,
};

export function SocioFormDialog({
  socio,
  trigger,
}: {
  socio?: Socio;
  trigger: React.ReactNode;
}) {
  const isEditing = Boolean(socio);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SocioInput>(emptyForm);

  const createSocio = useCreateSocio();
  const updateSocio = useUpdateSocio();
  const isPending = createSocio.isPending || updateSocio.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setForm(
        socio
          ? {
              nome: socio.nome,
              email: socio.email,
              papel: socio.papel,
              ativo: socio.ativo,
              participaPlanoSaude: socio.participaPlanoSaude,
            }
          : emptyForm
      );
    }
    setOpen(nextOpen);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const action = isEditing
      ? updateSocio.mutateAsync({ id: socio!.id, input: form })
      : createSocio.mutateAsync(form);

    action.then(() => setOpen(false));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar sócio" : "Novo sócio"}</DialogTitle>
            <DialogDescription>
              Dados usados no rateio de despesas compartilhadas (ex.: plano de
              saúde).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="papel">Papel</Label>
              <Select
                value={form.papel}
                onValueChange={(value) =>
                  setForm({ ...form, papel: value as PapelSocio })
                }
              >
                <SelectTrigger id="papel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="socio">Sócio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.participaPlanoSaude}
                onCheckedChange={(checked) =>
                  setForm({ ...form, participaPlanoSaude: checked === true })
                }
              />
              Participa do plano de saúde
            </label>

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
