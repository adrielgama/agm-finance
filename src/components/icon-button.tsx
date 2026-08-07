"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type IconButtonProps = ComponentProps<typeof Button> & {
  tooltip: string;
};

/** Botão de ícone com tooltip — padrão pra ações de tabela (editar, excluir, etc.). */
export function IconButton({ tooltip, size = "icon", ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size={size} {...props} />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
