"use server";

import {
  FieldValue,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import type { StatusMensalLancamento } from "@/types/status-mensal";

const COLLECTION = "statusMensalLancamentos";

function docId(lancamentoFixoId: string, mes: string) {
  return `${lancamentoFixoId}_${mes}`;
}

function mapDoc(doc: QueryDocumentSnapshot): StatusMensalLancamento {
  const data = doc.data();
  return {
    id: doc.id,
    lancamentoFixoId: data.lancamentoFixoId,
    mes: data.mes,
    pago: data.pago,
    dataPagamento: data.dataPagamento
      ? (data.dataPagamento as Timestamp).toDate()
      : null,
    updatedAt: (data.updatedAt as Timestamp | undefined)?.toDate() ?? new Date(),
  };
}

/**
 * Sem filtro de mês: a coleção só tem um doc por override manual (não por
 * ocorrência), então cabe trazer tudo de uma vez — igual transações e notas
 * fiscais, que também são filtradas por mês no cliente. Necessário pro
 * cálculo de saldo atual, que precisa olhar vários meses de uma vez.
 */
export async function listStatusMensal(): Promise<StatusMensalLancamento[]> {
  await verifySession();
  const snapshot = await getAdminDb().collection(COLLECTION).get();
  return snapshot.docs.map(mapDoc);
}

export async function setStatusMensalLancamento(
  lancamentoFixoId: string,
  mes: string,
  pago: boolean
) {
  await verifySession();
  await getAdminDb()
    .collection(COLLECTION)
    .doc(docId(lancamentoFixoId, mes))
    .set({
      lancamentoFixoId,
      mes,
      pago,
      dataPagamento: pago ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    });
}
