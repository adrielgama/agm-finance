import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getConfiguracao,
  updateSaldoInicial,
} from "@/lib/firestore/configuracao";
import type { ConfiguracaoGeralInput } from "@/types/configuracao";

export const configuracaoQueryKey = ["configuracao"] as const;

export function useConfiguracao() {
  return useQuery({
    queryKey: configuracaoQueryKey,
    queryFn: getConfiguracao,
  });
}

export function useUpdateSaldoInicial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfiguracaoGeralInput) => updateSaldoInicial(input),
    onSuccess: () => {
      toast.success("Saldo inicial atualizado.");
      queryClient.invalidateQueries({ queryKey: configuracaoQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar o saldo inicial."),
  });
}
