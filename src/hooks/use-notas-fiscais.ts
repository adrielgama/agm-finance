import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createNotaFiscal,
  deleteNotaFiscal,
  listNotasFiscais,
  updateNotaFiscal,
} from "@/lib/firestore/notas-fiscais";
import type { NotaFiscalInput } from "@/types/nota-fiscal";

export const notasFiscaisQueryKey = ["notas-fiscais"] as const;

export function useNotasFiscais() {
  return useQuery({
    queryKey: notasFiscaisQueryKey,
    queryFn: listNotasFiscais,
  });
}

export function useCreateNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NotaFiscalInput) => createNotaFiscal(input),
    onSuccess: () => {
      toast.success("Nota fiscal adicionada.");
      queryClient.invalidateQueries({ queryKey: notasFiscaisQueryKey });
    },
    onError: () => toast.error("Não foi possível adicionar a nota fiscal."),
  });
}

export function useUpdateNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<NotaFiscalInput>;
    }) => updateNotaFiscal(id, input),
    onSuccess: () => {
      toast.success("Nota fiscal atualizada.");
      queryClient.invalidateQueries({ queryKey: notasFiscaisQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar a nota fiscal."),
  });
}

export function useDeleteNotaFiscal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotaFiscal(id),
    onSuccess: () => {
      toast.success("Nota fiscal removida.");
      queryClient.invalidateQueries({ queryKey: notasFiscaisQueryKey });
    },
    onError: () => toast.error("Não foi possível remover a nota fiscal."),
  });
}
