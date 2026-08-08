"use server";

import {
  FieldValue,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/dal";
import type { StatusMensalLancamento } from "@/types/status-mensal";
import { z } from "zod";

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
    valorRealCentavos: data.valorRealCentavos ?? null,
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

const statusInputSchema = z.object({
  lancamentoFixoId: z.string().min(1),
  mes: z.string().regex(/^\d{4}-\d{2}$/),
  pago: z.boolean(),
  dataPagamento: z.date().nullable().optional(),
  valorRealCentavos: z.number().int().nonnegative().nullable().optional(),
});

export async function setStatusMensalLancamento(input: {
  lancamentoFixoId: string;
  mes: string;
  pago: boolean;
  dataPagamento?: Date | null;
  valorRealCentavos?: number | null;
}) {
  await verifySession();
  const parsed = statusInputSchema.parse(input);
  await getAdminDb()
    .collection(COLLECTION)
    .doc(docId(parsed.lancamentoFixoId, parsed.mes))
    .set({
      lancamentoFixoId: parsed.lancamentoFixoId,
      mes: parsed.mes,
      pago: parsed.pago,
      dataPagamento:
        parsed.pago && parsed.dataPagamento
          ? Timestamp.fromDate(parsed.dataPagamento)
          : null,
      valorRealCentavos: parsed.pago
        ? (parsed.valorRealCentavos ?? null)
        : null,
      updatedAt: FieldValue.serverTimestamp(),
    });
}
