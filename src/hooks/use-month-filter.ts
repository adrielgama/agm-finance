"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Filtro de mês (nunca período de dias) compartilhado entre rotas, guardado
 * na URL (`?mes=YYYY-MM`) — sobrevive a refresh e dá pra compartilhar o link.
 */
export function useMonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mes = searchParams.get("mes") ?? currentMonthKey();

  const setMes = useCallback(
    (novoMes: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("mes", novoMes);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const { ano, mesNumero } = useMemo(() => {
    const [anoStr, mesStr] = mes.split("-");
    return { ano: Number(anoStr), mesNumero: Number(mesStr) };
  }, [mes]);

  const irParaMesAnterior = useCallback(() => {
    const data = new Date(ano, mesNumero - 2, 1);
    setMes(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`);
  }, [ano, mesNumero, setMes]);

  const irParaProximoMes = useCallback(() => {
    const data = new Date(ano, mesNumero, 1);
    setMes(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`);
  }, [ano, mesNumero, setMes]);

  return { mes, ano, mesNumero, setMes, irParaMesAnterior, irParaProximoMes };
}
