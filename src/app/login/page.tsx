import Image from "next/image";
import { GoogleSignInButton } from "./_components/google-sign-in-button";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/40">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image
            src="/brand/agm-icon.png"
            alt="AGM Digital"
            width={48}
            height={48}
            className="size-12 rounded-xl"
            priority
          />
          <h1 className="text-xl font-semibold">AGM Finance</h1>
          <p className="text-sm text-muted-foreground">
            Controle financeiro da AGM Digital
          </p>
        </div>

        <GoogleSignInButton />

        {error === "unauthorized" && (
          <p className="mt-4 text-center text-sm text-destructive">
            Esse e-mail não tem acesso a esse painel.
          </p>
        )}
      </div>
    </main>
  );
}
