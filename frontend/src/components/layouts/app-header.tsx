"use client";

import { MenuIcon } from "lucide-react";

import { Breadcrumbs, useBreadcrumbs } from "@/components/layouts/breadcrumbs";
import { NavUser } from "@/components/layouts/nav-user";
import { Button } from "@/components/ui/button";

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const nested = useBreadcrumbs().length > 1;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <MenuIcon />
      </Button>
      <div className="min-w-0 flex-1">{nested && <Breadcrumbs />}</div>
      <NavUser />
    </header>
  );
}
