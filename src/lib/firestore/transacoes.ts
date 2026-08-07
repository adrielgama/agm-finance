"use server";

import {
  FieldValue,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import type { Transacao, TransacaoInput } from "@/types/transacao";

const COLLECTION = "transacoes";

function toDate(value: Timestamp | null | undefined): Date {
  return value ? value.toDate() : new Date();
}

function mapDoc(doc: QueryDocumentSnapshot): Transacao {
  const data = doc.data();
  return {
    id: doc.id,
    tipo: data.tipo,
    nome: data.nome,
    categoria: data.categoria,
    valorCentavos: data.valorCentavos,
    data: toDate(data.data),
    pago: data.pago ?? true,
    responsavelId: data.responsavelId ?? null,
    observacao: data.observacao ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function listTransacoes(): Promise<Transacao[]> {
  await verifySession();
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("data", "desc")
    .get();
  return snapshot.docs.map(mapDoc);
}

export async function createTransacao(input: TransacaoInput) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      data: Timestamp.fromDate(input.data),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function updateTransacao(
  id: string,
  input: Partial<TransacaoInput>
) {
  await verifySession();

  const payload: Record<string, unknown> = {
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (input.data) payload.data = Timestamp.fromDate(input.data);

  await getAdminDb().collection(COLLECTION).doc(id).update(payload);
}

export async function deleteTransacao(id: string) {
  await verifySession();
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
