"use client";

import { XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { AppHeader } from "@/components/layouts/app-header";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { BreadcrumbsProvider } from "@/components/layouts/breadcrumbs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <BreadcrumbsProvider>
      <div className="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <AppSidebar className="sticky top-0 hidden h-screen lg:flex" />

        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            !mobileOpen && "pointer-events-none",
          )}
          aria-hidden={!mobileOpen}
        >
          <div
            className={cn(
              "absolute inset-0 bg-black/40 transition-opacity",
              mobileOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-64 transition-transform duration-200",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            inert={!mobileOpen}
          >
            <AppSidebar />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-3 text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <XIcon />
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <AppHeader onOpenMenu={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbsProvider>
  );
}
