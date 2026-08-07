import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listStatusMensal,
  setStatusMensalLancamento,
} from "@/lib/firestore/status-mensal";

export const statusMensalQueryKey = ["status-mensal"] as const;

export function useStatusMensal() {
  return useQuery({
    queryKey: statusMensalQueryKey,
    queryFn: listStatusMensal,
  });
}

export function useSetStatusMensalLancamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lancamentoFixoId,
      mes,
      pago,
    }: {
      lancamentoFixoId: string;
      mes: string;
      pago: boolean;
    }) => setStatusMensalLancamento(lancamentoFixoId, mes, pago),
    onSuccess: () => {
      toast.success("Status atualizado.");
      queryClient.invalidateQueries({ queryKey: statusMensalQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar o status."),
  });
}
