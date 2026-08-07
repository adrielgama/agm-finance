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
import { useDeleteSocio } from "@/hooks/use-socios";
import type { Socio } from "@/types/socio";
import { SocioFormDialog } from "./socio-form-dialog";

export function SociosTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function SociosTable({ socios }: { socios: Socio[] }) {
  const deleteSocio = useDeleteSocio();

  if (socios.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum sócio cadastrado ainda.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Plano de saúde</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {socios.map((socio) => (
          <TableRow key={socio.id}>
            <TableCell className="font-medium">{socio.nome}</TableCell>
            <TableCell className="text-muted-foreground">
              {socio.email}
            </TableCell>
            <TableCell className="capitalize">{socio.papel}</TableCell>
            <TableCell>{socio.participaPlanoSaude ? "Sim" : "Não"}</TableCell>
            <TableCell>
              <Badge variant={socio.ativo ? "default" : "secondary"}>
                {socio.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end gap-1">
              <TooltipWrap tooltip="Editar">
                <SocioFormDialog
                  socio={socio}
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
                  title="Remover sócio"
                  description={`Tem certeza que deseja remover ${socio.nome}? Essa ação não pode ser desfeita.`}
                  onConfirm={() => deleteSocio.mutate(socio.id)}
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
        ))}
      </TableBody>
    </Table>
  );
}
