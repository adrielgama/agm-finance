"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { IconButton } from "@/components/icon-button";
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
import {
  useDeleteNotaFiscal,
  useUpdateNotaFiscal,
} from "@/hooks/use-notas-fiscais";
import { formatCentavos, formatDate, formatMesReferencia } from "@/lib/format";
import { isNotaFiscalRecebida, type NotaFiscal } from "@/types/nota-fiscal";
import { NotaFiscalFormDialog } from "./nota-fiscal-form-dialog";

export function NotasFiscaisTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function NotasFiscaisTable({
  notasFiscais,
}: {
  notasFiscais: NotaFiscal[];
}) {
  const deleteNotaFiscal = useDeleteNotaFiscal();
  const updateNotaFiscal = useUpdateNotaFiscal();

  if (notasFiscais.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma nota fiscal cadastrada ainda.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Competência</TableHead>
          <TableHead>Emissão</TableHead>
          <TableHead>Recebimento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notasFiscais.map((nf) => {
          const recebida = isNotaFiscalRecebida(nf);

          return (
            <TableRow key={nf.id}>
              <TableCell className="font-medium">{nf.cliente}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatMesReferencia(nf.mesReferencia)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(nf.dataEmissao)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {nf.dataRecebimentoReal
                  ? formatDate(nf.dataRecebimentoReal)
                  : nf.dataRecebimentoPrevista
                    ? `previsto ${formatDate(nf.dataRecebimentoPrevista)}`
                    : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums text-positive">
                +{formatCentavos(nf.valorCentavos)}
              </TableCell>
              <TableCell>
                <Badge variant={recebida ? "default" : "secondary"}>
                  {recebida ? "Recebida" : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                {!recebida && (
                  <IconButton
                    variant="ghost"
                    tooltip="Marcar como recebida"
                    onClick={() =>
                      updateNotaFiscal.mutate({
                        id: nf.id,
                        input: { dataRecebimentoReal: new Date() },
                      })
                    }
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="size-4"
                    />
                    <span className="sr-only">Marcar como recebida</span>
                  </IconButton>
                )}
                <TooltipWrap tooltip="Editar">
                  <NotaFiscalFormDialog
                    notaFiscal={nf}
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
                    title="Remover nota fiscal"
                    description={`Tem certeza que deseja remover a nota da ${nf.cliente} (${formatMesReferencia(nf.mesReferencia)})? Essa ação não pode ser desfeita.`}
                    onConfirm={() => deleteNotaFiscal.mutate(nf.id)}
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
