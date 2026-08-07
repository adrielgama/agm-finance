import "server-only";
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";

/**
 * Converte Timestamps do Firestore em Date e injeta o id do documento.
 * `createdAt`/`updatedAt` são preenchidos com FieldValue.serverTimestamp() na
 * escrita e podem chegar como `null` na leitura otimista logo após o write.
 */
export function firestoreConverter<
  T extends { id: string; createdAt: Date; updatedAt: Date },
>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data) {
      const rest: Partial<T> = { ...(data as T) };
      delete rest.id;
      return rest;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
      const data = snapshot.data();
      return {
        ...data,
        id: snapshot.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as T;
    },
  };
}

function toDate(value: Timestamp | Date | null | undefined): Date {
  if (!value) return new Date();
  return value instanceof Timestamp ? value.toDate() : value;
}
