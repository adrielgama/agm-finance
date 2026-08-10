"use server";

import {
  FieldValue,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase-admin/firestore";
import { z } from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getAdminDb } from "@/lib/firebase/admin";
import type {
  FatorRCompetencia,
  FatorRCompetenciaInput,
} from "@/types/fator-r";

const COLLECTION = "fatorRCompetencias";

function mapDoc(doc: QueryDocumentSnapshot): FatorRCompetencia {
  const data = doc.data();
  return {
    id: doc.id,
    competencia: data.competencia,
    receitaCentavos: data.receitaCentavos,
    proLaboreCentavos: data.proLaboreCentavos,
    cppCentavos: data.cppCentavos,
    outrosFolhaCentavos: data.outrosFolhaCentavos ?? 0,
    confirmado: data.confirmado ?? false,
    origem: data.origem ?? "manual",
    proLaboreMinimoInformadoCentavos:
      data.proLaboreMinimoInformadoCentavos ?? null,
    observacao: data.observacao ?? null,
    updatedAt: (data.updatedAt as Timestamp | undefined)?.toDate() ?? new Date(),
  };
}
export async function listFatorRCompetencias(): Promise<FatorRCompetencia[]> {
  await verifySession();
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("competencia", "asc")
    .get();
  return snapshot.docs.map(mapDoc);
}

const competenciaSchema = z.object({
  competencia: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  receitaCentavos: z.number().int().nonnegative(),
  proLaboreCentavos: z.number().int().nonnegative(),
  cppCentavos: z.number().int().nonnegative(),
  outrosFolhaCentavos: z.number().int().nonnegative(),
  confirmado: z.boolean(),
  origem: z.enum(["contabilidade", "manual"]),
  proLaboreMinimoInformadoCentavos: z
    .number()
    .int()
    .nonnegative()
    .nullable(),
  observacao: z.string().trim().max(500).nullable(),
});

export async function upsertFatorRCompetencia(input: FatorRCompetenciaInput) {
  await verifySession();
  const parsed = competenciaSchema.parse(input);
  await getAdminDb().collection(COLLECTION).doc(parsed.competencia).set(
    {
      ...parsed,
      observacao: parsed.observacao || null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
