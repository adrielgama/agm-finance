"use server";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import { firestoreConverter } from "@/lib/firestore/converter";
import type { Socio, SocioInput } from "@/types/socio";

const COLLECTION = "socios";

function sociosRef() {
  return getAdminDb().collection(COLLECTION).withConverter(firestoreConverter<Socio>());
}

export async function listSocios(): Promise<Socio[]> {
  await verifySession();
  const snapshot = await sociosRef().orderBy("nome", "asc").get();
  return snapshot.docs.map((doc) => doc.data());
}

export async function createSocio(input: SocioInput) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function updateSocio(id: string, input: Partial<SocioInput>) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function deleteSocio(id: string) {
  await verifySession();
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
