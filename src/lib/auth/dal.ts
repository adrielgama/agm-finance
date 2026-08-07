import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { isEmailAllowed } from "@/lib/auth/allow-list";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
};

/**
 * Verifica a sessão atual e garante que o e-mail está na allow-list.
 * Memoizado por request (React cache) e chamado em toda página/Server Action protegida.
 */
export const verifySession = cache(async (): Promise<SessionUser> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  if (!isEmailAllowed(session.user.email)) {
    redirect("/login?error=unauthorized");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    picture: session.user.image ?? null,
  };
});
