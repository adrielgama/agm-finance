"use server";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import { firestoreConverter } from "@/lib/firestore/converter";
import type { LancamentoFixo, LancamentoFixoInput } from "@/types/lancamento-fixo";

const COLLECTION = "lancamentosFixos";

function lancamentosRef() {
  return getAdminDb()
    .collection(COLLECTION)
    .withConverter(firestoreConverter<LancamentoFixo>());
}

export async function listLancamentosFixos(): Promise<LancamentoFixo[]> {
  await verifySession();
  const snapshot = await lancamentosRef().orderBy("nome", "asc").get();
  return snapshot.docs.map((doc) => doc.data());
}

export async function createLancamentoFixo(input: LancamentoFixoInput) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function updateLancamentoFixo(
  id: string,
  input: Partial<LancamentoFixoInput>
) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteLancamentoFixo(id: string) {
  await verifySession();
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
