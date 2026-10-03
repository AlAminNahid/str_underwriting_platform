"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export interface Crumb {
  label: string;
  href?: string;
}

const BreadcrumbsContext = createContext<{
  items: Crumb[];
  setItems: Dispatch<SetStateAction<Crumb[]>>;
} | null>(null);

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Crumb[]>([]);
  const [itemsPath, setItemsPath] = useState(pathname);

  if (itemsPath !== pathname) {
    setItemsPath(pathname);
    setItems([]);
  }
  return (
    <BreadcrumbsContext.Provider value={{ items, setItems }}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}

function useBreadcrumbsContext() {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx)
    throw new Error("Breadcrumbs must be used inside <BreadcrumbsProvider>");
  return ctx;
}

export function useBreadcrumbs(): Crumb[] {
  return useBreadcrumbsContext().items;
}

export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  const { setItems } = useBreadcrumbsContext();
  const key = JSON.stringify(items);

  useEffect(() => {
    setItems(JSON.parse(key) as Crumb[]);
  }, [key, setItems]);

  return null;
}

export function Breadcrumbs() {
  const items = useBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {isLast || !item.href ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
