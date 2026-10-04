import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  badge,
  meta,
  actions,
}: {
  title: string;
  description?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          {badge}
        </div>
        {meta && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {meta}
          </div>
        )}
        {description && (
          <p className="mt-1 max-w-[70ch] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
