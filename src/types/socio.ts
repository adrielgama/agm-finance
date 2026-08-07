export type PapelSocio = "master" | "socio";

export type Socio = {
  id: string;
  nome: string;
  email: string;
  papel: PapelSocio;
  ativo: boolean;
  participaPlanoSaude: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SocioInput = Omit<Socio, "id" | "createdAt" | "updatedAt">;
