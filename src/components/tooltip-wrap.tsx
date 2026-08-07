import { Tooltip, TooltipContent } from "@/components/ui/tooltip";

/**
 * Encaixa um tooltip em volta de um trigger que já é `asChild` de outra
 * coisa (Dialog/AlertDialog) — o filho precisa conter seu próprio
 * `<TooltipTrigger asChild>` envolvendo o elemento real (ver
 * `socios-table.tsx` como referência). Radix compõe as camadas de `asChild`
 * corretamente desde que Trigger e Content sejam descendentes do mesmo
 * `<Tooltip>`, não precisam ser irmãos diretos.
 */
export function TooltipWrap({
  tooltip,
  children,
}: {
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      {children}
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
