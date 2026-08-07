"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLancamentosFixos } from "@/hooks/use-lancamentos-fixos";
import { useSocios } from "@/hooks/use-socios";
import { LancamentoFormDialog } from "./_components/lancamento-form-dialog";
import {
  LancamentosTable,
  LancamentosTableSkeleton,
} from "./_components/lancamentos-table";

export default function LancamentosFixosPage() {
  const { data: lancamentos, isLoading } = useLancamentosFixos();
  const { data: socios } = useSocios();

  const despesas = (lancamentos ?? []).filter((l) => l.tipo === "despesa");
  const receitas = (lancamentos ?? []).filter((l) => l.tipo === "receita");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Lançamentos fixos</h1>
          <p className="text-sm text-muted-foreground">
            Despesas e receitas recorrentes mensais da AGM Digital.
          </p>
        </div>
        <LancamentoFormDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              Novo lançamento
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LancamentosTableSkeleton />
          ) : (
            <Tabs defaultValue="todos">
              <TabsList>
                <TabsTrigger value="todos">
                  Todos ({(lancamentos ?? []).length})
                </TabsTrigger>
                <TabsTrigger value="despesas">
                  Despesas ({despesas.length})
                </TabsTrigger>
                <TabsTrigger value="receitas">
                  Receitas ({receitas.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="todos">
                <LancamentosTable
                  lancamentos={lancamentos ?? []}
                  socios={socios ?? []}
                />
              </TabsContent>
              <TabsContent value="despesas">
                <LancamentosTable lancamentos={despesas} socios={socios ?? []} />
              </TabsContent>
              <TabsContent value="receitas">
                <LancamentosTable lancamentos={receitas} socios={socios ?? []} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
