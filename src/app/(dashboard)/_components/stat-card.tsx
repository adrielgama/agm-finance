import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardTone = "positive" | "negative" | "neutral";

const toneClasses: Record<StatCardTone, string> = {
  positive: "bg-positive/10 text-positive",
  negative: "bg-negative/10 text-negative",
  neutral: "bg-primary/10 text-primary",
};

export function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  icon: IconSvgElement;
  tone?: StatCardTone;
  hint?: string;
}) {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="flex items-start justify-between px-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            toneClasses[tone]
          )}
        >
          <HugeiconsIcon icon={icon} className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
