"use server";

import {
  FieldValue,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import type { NotaFiscal, NotaFiscalInput } from "@/types/nota-fiscal";

const COLLECTION = "notasFiscais";

function toDateOrNull(value: Timestamp | null | undefined): Date | null {
  return value ? value.toDate() : null;
}

function mapDoc(doc: QueryDocumentSnapshot): NotaFiscal {
  const data = doc.data();
  return {
    id: doc.id,
    cliente: data.cliente,
    valorCentavos: data.valorCentavos,
    mesReferencia: data.mesReferencia,
    dataEmissao: (data.dataEmissao as Timestamp).toDate(),
    dataRecebimentoPrevista: toDateOrNull(data.dataRecebimentoPrevista),
    dataRecebimentoReal: toDateOrNull(data.dataRecebimentoReal),
    observacao: data.observacao ?? null,
    createdAt: toDateOrNull(data.createdAt) ?? new Date(),
    updatedAt: toDateOrNull(data.updatedAt) ?? new Date(),
  };
}

export async function listNotasFiscais(): Promise<NotaFiscal[]> {
  await verifySession();
  const snapshot = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("mesReferencia", "desc")
    .get();
  return snapshot.docs.map(mapDoc);
}

export async function createNotaFiscal(input: NotaFiscalInput) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      dataEmissao: Timestamp.fromDate(input.dataEmissao),
      dataRecebimentoPrevista: input.dataRecebimentoPrevista
        ? Timestamp.fromDate(input.dataRecebimentoPrevista)
        : null,
      dataRecebimentoReal: input.dataRecebimentoReal
        ? Timestamp.fromDate(input.dataRecebimentoReal)
        : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function updateNotaFiscal(
  id: string,
  input: Partial<NotaFiscalInput>
) {
  await verifySession();

  const payload: Record<string, unknown> = {
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.dataEmissao) {
    payload.dataEmissao = Timestamp.fromDate(input.dataEmissao);
  }
  if ("dataRecebimentoPrevista" in input) {
    payload.dataRecebimentoPrevista = input.dataRecebimentoPrevista
      ? Timestamp.fromDate(input.dataRecebimentoPrevista)
      : null;
  }
  if ("dataRecebimentoReal" in input) {
    payload.dataRecebimentoReal = input.dataRecebimentoReal
      ? Timestamp.fromDate(input.dataRecebimentoReal)
      : null;
  }

  await getAdminDb().collection(COLLECTION).doc(id).update(payload);
}

export async function deleteNotaFiscal(id: string) {
  await verifySession();
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
