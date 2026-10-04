"use client";

import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/types/underwriting";

import { useWorkspace } from "./workspace-context";

export function SectionStatus({ sections }: { sections: SectionId[] }) {
  const all = useWorkspace().issues.filter((issue) =>
    sections.includes(issue.section),
  );

  if (all.length === 0) {
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-md bg-success-soft px-2 text-xs font-medium text-success">
        <CheckIcon className="size-3.5" aria-hidden />
        Complete
      </span>
    );
  }
  const invalid = all.some((issue) => issue.kind === "invalid");
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-medium",
        invalid ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning",
      )}
    >
      {all.length} {invalid ? "to fix" : "missing"}
    </span>
  );
}

export function SectionCard({
  id,
  title,
  description,
  status,
  headerAction,
  footer,
  children,
}: {
  id: string;
  title: string;
  description: string;
  status?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-24" data-testid={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {(status || headerAction) && (
          <CardAction className="flex items-center gap-2">
            {headerAction}
            {status}
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex-wrap gap-3">{footer}</CardFooter>}
    </Card>
  );
}
