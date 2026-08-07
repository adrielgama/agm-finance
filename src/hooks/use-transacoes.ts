import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTransacao,
  deleteTransacao,
  listTransacoes,
  updateTransacao,
} from "@/lib/firestore/transacoes";
import type { TransacaoInput } from "@/types/transacao";

export const transacoesQueryKey = ["transacoes"] as const;

export function useTransacoes() {
  return useQuery({
    queryKey: transacoesQueryKey,
    queryFn: listTransacoes,
  });
}

export function useCreateTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransacaoInput) => createTransacao(input),
    onSuccess: () => {
      toast.success("Transação adicionada.");
      queryClient.invalidateQueries({ queryKey: transacoesQueryKey });
    },
    onError: () => toast.error("Não foi possível adicionar a transação."),
  });
}

export function useUpdateTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TransacaoInput>;
    }) => updateTransacao(id, input),
    onSuccess: () => {
      toast.success("Transação atualizada.");
      queryClient.invalidateQueries({ queryKey: transacoesQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar a transação."),
  });
}

export function useDeleteTransacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransacao(id),
    onSuccess: () => {
      toast.success("Transação removida.");
      queryClient.invalidateQueries({ queryKey: transacoesQueryKey });
    },
    onError: () => toast.error("Não foi possível remover a transação."),
  });
}
