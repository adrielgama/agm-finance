import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSocio,
  deleteSocio,
  listSocios,
  updateSocio,
} from "@/lib/firestore/socios";
import type { SocioInput } from "@/types/socio";

export const sociosQueryKey = ["socios"] as const;

export function useSocios() {
  return useQuery({
    queryKey: sociosQueryKey,
    queryFn: listSocios,
  });
}

export function useCreateSocio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SocioInput) => createSocio(input),
    onSuccess: () => {
      toast.success("Sócio adicionado.");
      queryClient.invalidateQueries({ queryKey: sociosQueryKey });
    },
    onError: () => toast.error("Não foi possível adicionar o sócio."),
  });
}

export function useUpdateSocio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SocioInput> }) =>
      updateSocio(id, input),
    onSuccess: () => {
      toast.success("Sócio atualizado.");
      queryClient.invalidateQueries({ queryKey: sociosQueryKey });
    },
    onError: () => toast.error("Não foi possível atualizar o sócio."),
  });
}

export function useDeleteSocio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSocio(id),
    onSuccess: () => {
      toast.success("Sócio removido.");
      queryClient.invalidateQueries({ queryKey: sociosQueryKey });
    },
    onError: () => toast.error("Não foi possível remover o sócio."),
  });
}
