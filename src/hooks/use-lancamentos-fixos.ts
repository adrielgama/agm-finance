import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createLancamentoFixo,
  deleteLancamentoFixo,
  listLancamentosFixos,
  updateLancamentoFixo,
} from "@/lib/firestore/lancamentos-fixos";
import type { LancamentoFixoInput } from "@/types/lancamento-fixo";

export const lancamentosFixosQueryKey = ["lancamentos-fixos"] as const;

export function useLancamentosFixos() {
  return useQuery({
    queryKey: lancamentosFixosQueryKey,
    queryFn: listLancamentosFixos,
  });
}

export function useCreateLancamentoFixo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LancamentoFixoInput) => createLancamentoFixo(input),
    onSuccess: () => {
      toast.success("Lançamento adicionado.");
      queryClient.invalidateQueries({ queryKey: lancamentosFixosQueryKey });
    },
    onError: () => toast.error("Não foi possível adicionar o lançamento."),
  });
}

export function useUpdateLancamentoFixo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<LancamentoFixoInput>;
    }) => updateLancamentoFixo(id, input),
    onSuccess: () => {
      toast.success("Lançamento atualizado.");
      queryClient.invalidateQueries({ queryKey: lancamentosFixosQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar o lançamento."),
  });
}

export function useDeleteLancamentoFixo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLancamentoFixo(id),
    onSuccess: () => {
      toast.success("Lançamento removido.");
      queryClient.invalidateQueries({ queryKey: lancamentosFixosQueryKey });
    },
    onError: () => toast.error("Não foi possível remover o lançamento."),
  });
}
