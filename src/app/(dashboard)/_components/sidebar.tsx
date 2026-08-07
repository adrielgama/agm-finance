import { NavList } from "./nav-list";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          A
        </div>
        <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
          AGM Finance
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavList />
      </div>

      <div className="px-6 py-4 text-xs text-sidebar-foreground/40">
        AGM Digital &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
