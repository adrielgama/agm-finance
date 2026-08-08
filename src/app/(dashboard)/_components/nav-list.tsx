"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:border-white/5 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive &&
                "border-primary/15 bg-primary/12 text-primary shadow-[inset_0_1px_0_color-mix(in_oklab,var(--primary)_8%,transparent),0_12px_28px_-22px_color-mix(in_oklab,var(--primary)_70%,transparent)] hover:border-primary/20 hover:bg-primary/15 hover:text-primary",
            )}
          >
            <HugeiconsIcon icon={item.icon} className="size-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
