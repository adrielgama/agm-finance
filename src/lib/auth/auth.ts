import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { firestoreAdapter, initFirestore } from "better-auth-firestore";
import { cert } from "firebase-admin/app";
import { isEmailAllowed } from "@/lib/auth/allow-list";

const firestore = initFirestore({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
  name: "better-auth",
});

function ensureEmailIsAllowed(email: string | null | undefined) {
  if (!isEmailAllowed(email)) {
    throw new APIError("FORBIDDEN", {
      message: "Este e-mail não tem acesso ao AGM Finance.",
    });
  }
}

export const auth = betterAuth({
  database: firestoreAdapter({ firestore }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          ensureEmailIsAllowed(user.email);
          return { data: user };
        },
      },
      update: {
        before: async (user) => {
          if (user.email !== undefined) {
            ensureEmailIsAllowed(user.email);
          }
          return { data: user };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await firestore
            .collection("users")
            .doc(session.userId)
            .get();

          ensureEmailIsAllowed(user.data()?.email);
          return { data: session };
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
