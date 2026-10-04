"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { FormIssue, UnderwritingCalculation } from "@/types/underwriting";

interface WorkspaceContextValue {
  issues: FormIssue[];
  issuesByPath: Map<string, FormIssue>;
  calculation: UnderwritingCalculation;
  showAllErrors: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextValue;
  children: ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}
