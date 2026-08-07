"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocios } from "@/hooks/use-socios";
import { SocioFormDialog } from "./_components/socio-form-dialog";
import { SociosTable, SociosTableSkeleton } from "./_components/socios-table";

export default function SociosPage() {
  const { data: socios, isLoading } = useSocios();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sócios</h1>
          <p className="text-sm text-muted-foreground">
            Adriel, Abimael e Monyse — usado no rateio de despesas
            compartilhadas.
          </p>
        </div>
        <SocioFormDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              Novo sócio
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os sócios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SociosTableSkeleton />
          ) : (
            <SociosTable socios={socios ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
