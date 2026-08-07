"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./google-icon";

export function GoogleSignInButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleSignIn() {
    setIsPending(true);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });

    if (error) {
      toast.error(error.message ?? "Não foi possível entrar com o Google.");
      setIsPending(false);
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isPending}
      size="lg"
      className="w-full gap-3"
    >
      {isPending ? (
        <HugeiconsIcon icon={Loading03Icon} className="size-5 animate-spin" />
      ) : (
        <GoogleIcon className="size-5" />
      )}
      Entrar com Google
    </Button>
  );
}
