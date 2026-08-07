import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Nome próprio (nunca "[DEFAULT]"): o better-auth-firestore inicializa sua
// própria app nomeada "better-auth" (ver src/lib/auth/auth.ts). Se essa app
// já existir, `getApps()` deixa de estar vazio e um `getApp()` sem nome (que
// busca especificamente a app "[DEFAULT]") quebra com "The default Firebase
// app does not exist" — por isso sempre buscamos/criamos pelo nome exato.
const APP_NAME = "admin";

function getAdminApp(): App {
  const existing = getApps().find((candidate) => candidate.name === APP_NAME);
  if (existing) return existing;

  return initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    },
    APP_NAME
  );
}

let cachedDb: Firestore | undefined;

/** Inicializado sob demanda: evita quebrar o build antes das credenciais existirem. */
export function getAdminDb() {
  if (!cachedDb) cachedDb = getFirestore(getAdminApp());
  return cachedDb;
}
