"use client";

import { useState, type FormEvent } from "react";
import {
  CalculatorIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  PencilIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { CurrencyInput } from "@/components/currency-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertFatorRCompetencia } from "@/hooks/use-fator-r";
import {
  calcularProLaboreMinimoDaUltimaCompetencia,
  calcularResumoFatorR,
  projetarProximaCompetencia,
  totalFolhaCompetencia,
} from "@/lib/fator-r";
import { formatCentavos, formatMesReferencia } from "@/lib/format";
import type {
  FatorRCompetencia,
  FatorRCompetenciaInput,
} from "@/types/fator-r";

function proximaCompetencia(competencia: string) {
  const [ano, mes] = competencia.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes, 1));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}
function formatPercentual(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function EditarCompetenciaDialog({ item }: { item: FatorRCompetencia }) {
  const [open, setOpen] = useState(false);
  const [receitaCentavos, setReceitaCentavos] = useState(item.receitaCentavos);
  const [proLaboreCentavos, setProLaboreCentavos] = useState(
    item.proLaboreCentavos,
  );
  const [cppCentavos, setCppCentavos] = useState(item.cppCentavos);
  const [outrosFolhaCentavos, setOutrosFolhaCentavos] = useState(
    item.outrosFolhaCentavos,
  );
  const [confirmado, setConfirmado] = useState(item.confirmado);
  const [observacao, setObservacao] = useState(item.observacao ?? "");
  const mutation = useUpsertFatorRCompetencia();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: FatorRCompetenciaInput = {
      competencia: item.competencia,
      receitaCentavos,
      proLaboreCentavos,
      cppCentavos,
      outrosFolhaCentavos,
      confirmado,
      origem: confirmado ? "contabilidade" : "manual",
      proLaboreMinimoInformadoCentavos: item.proLaboreMinimoInformadoCentavos,
      observacao: observacao.trim() || null,
    };
    await mutation.mutateAsync(input);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Editar competência">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>
              Editar {formatMesReferencia(item.competencia)}
            </DialogTitle>
            <DialogDescription>
              Use os valores da competência informados pela contabilidade.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`receita-${item.id}`}>Faturamento emitido</Label>
              <CurrencyInput
                id={`receita-${item.id}`}
                defaultValueCentavos={receitaCentavos}
                onValueChange={setReceitaCentavos}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`pro-labore-${item.id}`}>Pró-labore bruto</Label>
              <CurrencyInput
                id={`pro-labore-${item.id}`}
                defaultValueCentavos={proLaboreCentavos}
                onValueChange={setProLaboreCentavos}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`cpp-${item.id}`}>CPP</Label>
              <CurrencyInput
                id={`cpp-${item.id}`}
                defaultValueCentavos={cppCentavos}
                onValueChange={setCppCentavos}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`outros-${item.id}`}>
                Outros valores da folha
              </Label>
              <CurrencyInput
                id={`outros-${item.id}`}
                defaultValueCentavos={outrosFolhaCentavos}
                onValueChange={setOutrosFolhaCentavos}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor={`observacao-${item.id}`}>Observação</Label>
              <Textarea
                id={`observacao-${item.id}`}
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
                maxLength={500}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 sm:col-span-2">
              <div>
                <Label htmlFor={`confirmado-${item.id}`}>
                  Confirmado pela contabilidade
                </Label>
                <p className="text-xs text-muted-foreground">
                  Desative enquanto algum valor da competência estiver pendente.
                </p>
              </div>
              <Switch
                id={`confirmado-${item.id}`}
                checked={confirmado}
                onCheckedChange={setConfirmado}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar competência"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FatorRDashboard({
  competencias,
  proLaboreAtualCentavos,
}: {
  competencias: FatorRCompetencia[];
  proLaboreAtualCentavos: number;
}) {
  const resumo = calcularResumoFatorR(competencias);
  const ultimaCompetencia = resumo.janela.at(-1);
  const minimoCalculado = calcularProLaboreMinimoDaUltimaCompetencia(
    resumo.janela,
  );
  const minimoContabilidade =
    ultimaCompetencia?.proLaboreMinimoInformadoCentavos ?? minimoCalculado;
  const proxima = proximaCompetencia(
    ultimaCompetencia?.competencia ?? "2026-08",
  );
  const [receitaProjetadaCentavos, setReceitaProjetadaCentavos] =
    useState(1_000_000);
  const [proLaboreProjetadoCentavos, setProLaboreProjetadoCentavos] = useState(
    proLaboreAtualCentavos,
  );
  const projecao = projetarProximaCompetencia({
    competencias: resumo.janela,
    competencia: proxima,
    receitaCentavos: receitaProjetadaCentavos,
    proLaboreCentavos: proLaboreProjetadoCentavos,
  });
  const progresso = Math.min(100, (resumo.fatorR / 0.28) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card variant="brand">
          <CardHeader>
            <CardDescription>Fator R atual</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {formatPercentual(resumo.fatorR)}
            </CardTitle>
            <CardAction className="rounded-lg bg-primary/15 p-2 text-primary">
              <CalculatorIcon className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Progress value={progresso} className="mb-2" />
            <p className="text-xs text-muted-foreground">Meta mínima: 28%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Enquadramento</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              Anexo {resumo.enquadramento.anexo}
            </CardTitle>
            <CardAction className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <ShieldCheckIcon className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Alíquota inicial de {resumo.enquadramento.aliquotaInicial}%
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Receita dos 12 meses</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {formatCentavos(resumo.receitaCentavos)}
            </CardTitle>
            <CardAction className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
              <ReceiptTextIcon className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Pela competência de emissão das notas
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Folha dos 12 meses</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {formatCentavos(resumo.folhaCentavos)}
            </CardTitle>
            <CardAction className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
              <CircleDollarSignIcon className="size-4" />
            </CardAction>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Margem de {formatCentavos(resumo.margemCentavos)} sobre a meta
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leitura de agosto</CardTitle>
          <CardDescription>
            Com o pró-labore bruto atual, a empresa permanece acima dos 28%.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Pró-labore atual</p>
            <p className="mt-1 text-lg font-semibold">
              {formatCentavos(ultimaCompetencia?.proLaboreCentavos ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">
              Mínimo informado pela contabilidade
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatCentavos(minimoContabilidade)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/6 p-3">
            <p className="text-xs text-emerald-300">Folga no pró-labore</p>
            <p className="mt-1 text-lg font-semibold text-emerald-300">
              {formatCentavos(
                Math.max(
                  0,
                  (ultimaCompetencia?.proLaboreCentavos ?? 0) -
                    minimoContabilidade,
                ),
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico usado no cálculo</CardTitle>
          <CardDescription>
            Receita emitida, pró-labore bruto e CPP por competência.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table containerClassName="max-h-[22rem] [scrollbar-gutter:stable]">
            <TableHeader className="sticky top-0 z-20 bg-card shadow-[0_1px_0_var(--border)]">
              <TableRow>
                <TableHead className="pl-4">Competência</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
                <TableHead className="text-right">Pró-labore</TableHead>
                <TableHead className="text-right">CPP</TableHead>
                <TableHead className="text-right">Total da folha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...resumo.janela].reverse().map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-4 font-medium">
                    {formatMesReferencia(item.competencia)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentavos(item.receitaCentavos)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentavos(item.proLaboreCentavos)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentavos(item.cppCentavos)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCentavos(totalFolhaCompetencia(item))}
                  </TableCell>
                  <TableCell>
                    {item.confirmado ? (
                      <Badge className="bg-emerald-500/10 text-emerald-300">
                        <CheckCircle2Icon /> Confirmado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-300">
                        <TriangleAlertIcon /> Parcial
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <EditarCompetenciaDialog
                      key={`${item.id}-${item.updatedAt.getTime()}`}
                      item={item}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="sticky bottom-0 z-20 bg-card shadow-[0_-1px_0_var(--border)]">
              <TableRow>
                <TableCell className="pl-4">Total</TableCell>
                <TableCell className="text-right">
                  {formatCentavos(resumo.receitaCentavos)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="text-right">
                  {formatCentavos(resumo.folhaCentavos)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prévia de {formatMesReferencia(proxima)}</CardTitle>
          <CardDescription>
            Cenário conservador sem CPP futura, até a contabilidade informar o
            valor. A estimativa não altera o histórico salvo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
          <div className="grid gap-2">
            <Label htmlFor="receita-projetada">Faturamento previsto</Label>
            <CurrencyInput
              id="receita-projetada"
              defaultValueCentavos={receitaProjetadaCentavos}
              onValueChange={setReceitaProjetadaCentavos}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pro-labore-projetado">Pró-labore previsto</Label>
            <CurrencyInput
              id="pro-labore-projetado"
              defaultValueCentavos={proLaboreProjetadoCentavos}
              onValueChange={setProLaboreProjetadoCentavos}
            />
          </div>
          <div
            className={`rounded-lg border p-3 ${
              projecao.resumo.enquadramento.anexo === "III"
                ? "border-emerald-500/20 bg-emerald-500/6"
                : "border-amber-500/20 bg-amber-500/6"
            }`}
          >
            <p className="text-xs text-muted-foreground">Resultado estimado</p>
            <p className="mt-1 text-lg font-semibold">
              {formatPercentual(projecao.resumo.fatorR)} · Anexo{" "}
              {projecao.resumo.enquadramento.anexo}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pró-labore mínimo estimado:{" "}
              <strong className="text-foreground">
                {formatCentavos(projecao.proLaboreMinimoCentavos)}
              </strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
