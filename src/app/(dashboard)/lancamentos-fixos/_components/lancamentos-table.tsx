"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipWrap } from "@/components/tooltip-wrap";
import { useDeleteLancamentoFixo } from "@/hooks/use-lancamentos-fixos";
import { formatCentavos } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORIA_LABEL, type LancamentoFixo } from "@/types/lancamento-fixo";
import type { Socio } from "@/types/socio";
import { LancamentoFormDialog } from "./lancamento-form-dialog";

export function LancamentosTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function LancamentosTable({
  lancamentos,
  socios,
}: {
  lancamentos: LancamentoFixo[];
  socios: Socio[];
}) {
  const deleteLancamento = useDeleteLancamentoFixo();

  if (lancamentos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum lançamento fixo cadastrado ainda.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lancamentos.map((lancamento) => {
          const responsavel = socios.find(
            (s) => s.id === lancamento.responsavelId
          );

          return (
            <TableRow key={lancamento.id}>
              <TableCell className="font-medium">{lancamento.nome}</TableCell>
              <TableCell className="text-muted-foreground">
                {CATEGORIA_LABEL[lancamento.categoria]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {responsavel?.nome ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                Dia {lancamento.diaVencimento}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  lancamento.tipo === "despesa" ? "text-negative" : "text-positive"
                )}
              >
                {lancamento.tipo === "despesa" ? "-" : "+"}
                {formatCentavos(lancamento.valorCentavos)}
              </TableCell>
              <TableCell>
                <Badge variant={lancamento.ativo ? "default" : "secondary"}>
                  {lancamento.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <TooltipWrap tooltip="Editar">
                  <LancamentoFormDialog
                    lancamento={lancamento}
                    trigger={
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </TooltipTrigger>
                    }
                  />
                </TooltipWrap>
                <TooltipWrap tooltip="Excluir">
                  <ConfirmDeleteDialog
                    title="Remover lançamento"
                    description={`Tem certeza que deseja remover "${lancamento.nome}"? Essa ação não pode ser desfeita.`}
                    onConfirm={() => deleteLancamento.mutate(lancamento.id)}
                    trigger={
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </TooltipTrigger>
                    }
                  />
                </TooltipWrap>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
