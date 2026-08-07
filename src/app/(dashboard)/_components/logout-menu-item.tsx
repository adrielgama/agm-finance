"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout04Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";

export function LogoutMenuItem() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Não foi possível sair. Tente novamente.");
      setIsPending(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        handleLogout();
      }}
      disabled={isPending}
      variant="destructive"
    >
      <HugeiconsIcon
        icon={isPending ? Loading03Icon : Logout04Icon}
        className={isPending ? "size-4 animate-spin" : "size-4"}
      />
      Sair
    </DropdownMenuItem>
  );
}
