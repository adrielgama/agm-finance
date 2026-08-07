"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { SessionUser } from "@/lib/auth/dal";
import { LogoutMenuItem } from "./logout-menu-item";
import { NavList } from "./nav-list";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({ user }: { user: SessionUser }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      toast.success("Dados atualizados.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsMobileNavOpen(true)}
      >
        <HugeiconsIcon icon={Menu01Icon} className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex h-16 items-center gap-2 px-6">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              A
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground">
              AGM Finance
            </span>
          </div>
          <div className="px-3 py-4">
            <NavList onNavigate={() => setIsMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden text-sm text-muted-foreground lg:block">
        Olá, {user.name.split(" ")[0]}
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          variant="ghost"
          tooltip="Atualizar dados"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <HugeiconsIcon
            icon={Refresh01Icon}
            className={isRefreshing ? "size-4 animate-spin" : "size-4"}
          />
          <span className="sr-only">Atualizar dados</span>
        </IconButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-primary focus-visible:ring-2">
              <Avatar className="size-9">
                <AvatarImage src={user.picture ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/15 text-primary">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <LogoutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
