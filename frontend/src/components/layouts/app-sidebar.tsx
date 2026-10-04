"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { MAIN_NAV } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard) {
    return (
      pathname === "/" ||
      pathname.startsWith("/properties") ||
      pathname.startsWith("/underwritings")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link
      href={ROUTES.dashboard}
      className="mb-4 flex flex-col items-center rounded-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      aria-label={`${siteConfig.company} ${siteConfig.name}, go to dashboard`}
    >
      <span className="inline-block rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
        <Image
          src="/brand/str-search-logo.webp"
          alt=""
          width={500}
          height={127}
          priority
          className="h-auto w-[132px]"
        />
      </span>
      <span className="mt-2.5 flex items-center justify-center gap-2">
        <span className="h-4 w-0.5 rounded-full bg-gold" aria-hidden />
        <span className="font-brand text-[15px] font-extrabold tracking-tight">
          {siteConfig.name}
        </span>
      </span>
    </Link>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-1 bg-sidebar px-3 py-4 text-sidebar-foreground",
        className,
      )}
      aria-label="Primary"
    >
      <Brand />

      <p className="px-2.5 pt-2 pb-1.5 text-[11px] font-medium tracking-wider text-sidebar-muted-foreground uppercase">
        Training
      </p>
      <nav className="flex flex-col gap-0.5">
        {MAIN_NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                "focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
                active
                  ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
