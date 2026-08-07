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
import { useDeleteTransacao } from "@/hooks/use-transacoes";
import { formatCentavos, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORIA_LABEL } from "@/types/lancamento-fixo";
import type { Socio } from "@/types/socio";
import type { Transacao } from "@/types/transacao";
import { TransacaoFormDialog } from "./transacao-form-dialog";

export function TransacoesTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function TransacoesTable({
  transacoes,
  socios,
}: {
  transacoes: Transacao[];
  socios: Socio[];
}) {
  const deleteTransacao = useDeleteTransacao();

  if (transacoes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma transação neste mês.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transacoes.map((transacao) => {
          const responsavel = socios.find((s) => s.id === transacao.responsavelId);

          return (
            <TableRow key={transacao.id}>
              <TableCell className="text-muted-foreground">
                {formatDate(transacao.data)}
              </TableCell>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  {transacao.nome}
                  {!transacao.pago && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pendente
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {CATEGORIA_LABEL[transacao.categoria]}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {responsavel?.nome ?? "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  transacao.tipo === "despesa" ? "text-negative" : "text-positive"
                )}
              >
                {transacao.tipo === "despesa" ? "-" : "+"}
                {formatCentavos(transacao.valorCentavos)}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <TooltipWrap tooltip="Editar">
                  <TransacaoFormDialog
                    transacao={transacao}
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
                    title="Remover transação"
                    description={`Tem certeza que deseja remover "${transacao.nome}"? Essa ação não pode ser desfeita.`}
                    onConfirm={() => deleteTransacao.mutate(transacao.id)}
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
