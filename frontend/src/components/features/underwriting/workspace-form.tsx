"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { useAutosave } from "@/hooks/use-autosave";
import { useSubmitUnderwriting } from "@/hooks/use-underwriting";
import { useWorkspaceStep } from "@/hooks/use-workspace-step";
import { ApiError } from "@/services/api-client";
import {
  calculateUnderwriting,
  parseInput,
} from "@/lib/underwriting/calculations";
import {
  pickInitialValues,
  writeDraftBackup,
} from "@/lib/underwriting/draft-storage";
import { toSavePayload } from "@/lib/underwriting/form-mapper";
import { getFormIssues } from "@/lib/underwriting/schema";
import type {
  FormIssue,
  UnderwritingDraft,
  UnderwritingFormValues,
} from "@/types/underwriting";

import { ActionBar } from "./action-bar";
import { AnalysisStep } from "./analysis/analysis-step";
import { DealSummary } from "./deal-summary";
import { FinancialsStep } from "./financials/financials-step";
import { ReviewStep } from "./review/review-step";
import { SubmitDialog } from "./review/submit-dialog";
import { StepTabs } from "./step-tabs";
import { DealTagsStep } from "./tags/deal-tags-step";
import { WorkspaceProvider } from "./workspace-context";

const BACKUP_DELAY_MS = 300;

export function WorkspaceForm({ draft }: { draft: UnderwritingDraft }) {
  const [initialValues] = useState(() =>
    pickInitialValues(draft.id, draft.values, draft.updatedAt),
  );
  const [serverPayload] = useState(() => toSavePayload(draft.values));

  const form = useForm<UnderwritingFormValues>({
    defaultValues: initialValues,
    mode: "onTouched",
  });
  const values = useWatch({ control: form.control }) as UnderwritingFormValues;

  const issues = useMemo(() => getFormIssues(values), [values]);
  const calculation = useMemo(() => calculateUnderwriting(values), [values]);
  const payload = useMemo(() => toSavePayload(values), [values]);

  const submit = useSubmitUnderwriting();
  const locked = submit.isPending || submit.isSuccess;

  const autosave = useAutosave({
    id: draft.id,
    payload,
    serverPayload,
    serverUpdatedAt: draft.updatedAt,
    enabled: !locked,
  });

  const { savedVersion } = autosave;
  useEffect(() => {
    if (locked) return;
    const timer = setTimeout(
      () => writeDraftBackup(draft.id, values, savedVersion),
      BACKUP_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [draft.id, values, savedVersion, locked]);

  const { step, goTo, previous, next } = useWorkspaceStep();

  const [reviewed, setReviewed] = useState(step === "review");
  if (step === "review" && !reviewed) setReviewed(true);

  const pendingFocus = useRef<FormIssue | null>(null);
  function goToIssue(issue: FormIssue) {
    pendingFocus.current = issue;
    goTo(issue.step);
  }
  useEffect(() => {
    const issue = pendingFocus.current;
    if (!issue || issue.step !== step) return;
    pendingFocus.current = null;
    const frame = requestAnimationFrame(() => {
      const input = document.querySelector<HTMLElement>(
        `[name="${issue.path}"]`,
      );
      const target =
        input ?? document.getElementById(`section-${issue.section}`);
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      input?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  function confirmSubmit() {
    submit.mutate({ id: draft.id, payload: toSavePayload(form.getValues()) });
  }
  const submitError = submit.error
    ? submit.error instanceof ApiError && submit.error.status === 422
      ? `The server couldn't grade this draft: ${submit.error.message}`
      : submit.error instanceof ApiError
        ? submit.error.message
        : "Something went wrong. Try again."
    : null;

  const context = useMemo(
    () => ({
      issues,
      issuesByPath: new Map(issues.map((issue) => [issue.path, issue])),
      calculation,
      showAllErrors: reviewed,
    }),
    [issues, calculation, reviewed],
  );

  return (
    <FormProvider {...form}>
      <WorkspaceProvider value={context}>
        <StepTabs current={step} onSelect={goTo} />
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <form
            className="flex min-w-0 flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
            noValidate
            aria-label="Underwriting inputs"
          >
            {step === "financials" && <FinancialsStep />}
            {step === "analysis" && <AnalysisStep />}
            {step === "tags" && <DealTagsStep />}
            {step === "review" && (
              <ReviewStep
                official={draft.official}
                saveStatus={autosave.status}
                onGoTo={goToIssue}
              />
            )}
            <ActionBar
              status={autosave.status}
              onRetry={autosave.retry}
              previous={previous}
              next={next}
              onNavigate={goTo}
              onSubmit={() => {
                submit.reset();
                setConfirmOpen(true);
              }}
              canSubmit={issues.length === 0 && !locked}
            />
          </form>
          <aside className="xl:sticky xl:top-20" aria-label="Deal summary">
            <DealSummary />
          </aside>
        </div>
        <SubmitDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          street={draft.street}
          midForecast={parseInput(values.revenue.mid)}
          calculation={calculation}
          submitting={locked}
          error={submitError}
          onConfirm={confirmSubmit}
        />
      </WorkspaceProvider>
    </FormProvider>
  );
}
