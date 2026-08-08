import { CalendarClock, ShieldCheck, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCentavos } from "@/lib/format";
import { cn } from "@/lib/utils";

type ResumoItem = {
  label: string;
  valorCentavos: number;
  hint: string;
  tone?: "positive" | "negative" | "primary";
};

const toneClasses = {
  positive: "text-positive",
  negative: "text-negative",
  primary: "text-primary",
};

const toneAccentClasses = {
  positive: "from-transparent via-positive/55 to-transparent",
  negative: "from-transparent via-negative/55 to-transparent",
  primary: "from-transparent via-primary/55 to-transparent",
};

export function ResumoCaixaCards({ itens }: { itens: ResumoItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {itens.map((item) => (
        <Card key={item.label} className="gap-2 py-5 hover:-translate-y-0.5">
          {item.tone && (
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r",
                toneAccentClasses[item.tone],
              )}
            />
          )}
          <CardContent className="flex flex-col gap-1 px-5">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                item.tone && toneClasses[item.tone],
              )}
            >
              {formatCentavos(item.valorCentavos)}
            </span>
            <span className="text-xs text-muted-foreground">{item.hint}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdiantamentoLucroCard({
  valorCentavos,
  disponivelHojeCentavos,
  reservaCentavos,
  margemCentavos,
  horizonte,
}: {
  valorCentavos: number;
  disponivelHojeCentavos: number;
  reservaCentavos: number;
  margemCentavos: number;
  horizonte: string;
}) {
  return (
    <Card variant="brand" className="py-0">
      <CardContent className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6">
        <div className="flex min-w-0 gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <WalletCards className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">
              Adiantamento de lucro disponível após o fechamento do mês
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {formatCentavos(valorCentavos)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimativa de caixa; a distribuição continua sujeita à validação
              contábil.
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
          <span className="flex items-center gap-2">
            <WalletCards className="size-3.5 text-primary" aria-hidden="true" />
            {formatCentavos(disponivelHojeCentavos)} suportados pelo caixa hoje
          </span>
          <span className="flex items-center gap-2">
            <CalendarClock
              className="size-3.5 text-primary"
              aria-hidden="true"
            />
            {formatCentavos(reservaCentavos)} protegidos {horizonte}
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            {formatCentavos(margemCentavos)} de margem de segurança
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
