import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listFatorRCompetencias,
  upsertFatorRCompetencia,
} from "@/lib/firestore/fator-r";
import type { FatorRCompetenciaInput } from "@/types/fator-r";

export const fatorRQueryKey = ["fator-r-competencias"] as const;

export function useFatorRCompetencias() {
  return useQuery({
    queryKey: fatorRQueryKey,
    queryFn: listFatorRCompetencias,
  });
}
export function useUpsertFatorRCompetencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FatorRCompetenciaInput) =>
      upsertFatorRCompetencia(input),
    onSuccess: () => {
      toast.success("Competência atualizada.");
      queryClient.invalidateQueries({ queryKey: fatorRQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar a competência."),
  });
}
