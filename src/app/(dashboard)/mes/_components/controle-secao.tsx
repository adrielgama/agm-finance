"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentavos } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ItemControle } from "./tipos";
import { ConfirmarMovimentoDialog } from "./confirmar-movimento-dialog";

export function ControleSecaoSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  );
}

export function ControleSecao({
  titulo,
  itens,
  tone,
  totalConfirmado,
  totalPendente,
  emptyLabel,
}: {
  titulo: string;
  itens: ItemControle[];
  tone: "positive" | "negative";
  totalConfirmado: number;
  totalPendente: number;
  emptyLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Confirmado</span>
            <span
              className={cn(
                "text-lg font-semibold tabular-nums",
                tone === "positive" ? "text-positive" : "text-negative",
              )}
            >
              {formatCentavos(totalConfirmado)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Pendente</span>
            <span className="text-lg font-semibold tabular-nums text-muted-foreground">
              {formatCentavos(totalPendente)}
            </span>
          </div>
        </div>

        {itens.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Status</TableHead>
                <TableHead className="w-14">Dia</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden w-48 md:table-cell">
                  Categoria
                </TableHead>
                <TableHead className="w-28 text-right sm:w-36">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow key={item.key}>
                  <TableCell>
                    <ConfirmarMovimentoDialog item={item} />
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {String(item.data.getUTCDate()).padStart(2, "0")}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "whitespace-normal font-medium",
                      !item.pago && "text-muted-foreground",
                    )}
                  >
                    {item.nome}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {item.categoria}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCentavos(item.valorCentavos)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
