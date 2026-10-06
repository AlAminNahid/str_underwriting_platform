"use client";

import { CircleAlertIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/format";
import { getSanityWarning } from "@/lib/underwriting/sanity-check";
import type { UnderwritingCalculation } from "@/types/underwriting";

export function SubmitDialog({
  open,
  onOpenChange,
  street,
  midForecast,
  calculation,
  submitting,
  error,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  street: string;
  midForecast: number | null;
  calculation: UnderwritingCalculation;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
}) {
  const mid = calculation.scenarios.mid;
  const coc = mid?.cashOnCash;
  const warning = getSanityWarning(calculation);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !submitting && onOpenChange(next)}
    >
      <AlertDialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-[560px]"
        data-testid="submit-dialog"
      >
        <AlertDialogHeader className="gap-2 px-7 pt-7 pb-5">
          <AlertDialogTitle className="text-lg font-semibold">
            Submit underwriting for grading?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] leading-relaxed">
            Your draft for {street} will be locked. Your Mid revenue forecast is
            compared with the analyst&apos;s reference. You can start a new
            attempt afterward.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warning && (
          <p
            className="mx-7 mb-3 flex gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm text-foreground/80"
            data-testid="submit-warning"
          >
            <TriangleAlertIcon
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden
            />
            <span>{warning}</span>
          </p>
        )}

        <dl className="mx-7 divide-y text-[15px]">
          {[
            ["Mid revenue forecast", formatCurrency(midForecast), true],
            [
              "Total out of pocket",
              formatCurrency(calculation.totalOutOfPocket),
              false,
            ],
            [
              "Annual free cash flow · Mid",
              formatCurrency(mid?.freeCashFlow),
              false,
            ],
            [
              "Cash-on-cash · Mid",
              coc == null ? "—" : `${coc.toFixed(1)}%`,
              false,
            ],
          ].map(([label, value, graded]) => (
            <div
              key={label as string}
              className="flex justify-between gap-4 py-3"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd
                className={
                  graded
                    ? "font-semibold text-[#a86a12] tabular-nums"
                    : "font-medium tabular-nums"
                }
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {error && (
          <p
            className="mx-7 mt-3 flex gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger"
            role="alert"
          >
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <b className="block font-semibold">Couldn&apos;t submit</b>
              {error}
            </span>
          </p>
        )}

        <AlertDialogFooter className="m-0 mt-5 rounded-none bg-card px-7 py-4">
          <AlertDialogCancel
            size="lg"
            className="h-10 px-4"
            disabled={submitting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            size="lg"
            className="h-10 px-4"
            onClick={onConfirm}
            disabled={submitting}
            data-testid="confirm-submit"
          >
            {submitting && (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            )}
            {submitting ? "Grading…" : "Submit for grading"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
