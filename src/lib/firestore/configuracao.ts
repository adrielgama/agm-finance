"use server";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import type {
  ConfiguracaoGeral,
  ConfiguracaoGeralInput,
} from "@/types/configuracao";

const COLLECTION = "configuracoes";
const DOC_ID = "geral";

export async function getConfiguracao(): Promise<ConfiguracaoGeral | null> {
  await verifySession();
  const doc = await getAdminDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    saldoInicialCentavos: data.saldoInicialCentavos,
    saldoInicialData: (data.saldoInicialData as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp | undefined)?.toDate() ?? new Date(),
  };
}

export async function updateSaldoInicial(input: ConfiguracaoGeralInput) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .doc(DOC_ID)
    .set({
      saldoInicialCentavos: input.saldoInicialCentavos,
      saldoInicialData: Timestamp.fromDate(input.saldoInicialData),
      updatedAt: FieldValue.serverTimestamp(),
    });
}
