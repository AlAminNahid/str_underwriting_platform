"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { parseInput } from "@/lib/underwriting/calculations";
import type { SectionId, UnderwritingFormValues } from "@/types/underwriting";

import { NumericField } from "../fields/numeric-field";
import { TextField } from "../fields/text-field";
import { SectionCard, SectionStatus } from "../section-card";
import { useWorkspace } from "../workspace-context";

type ListName = "optimizationItems" | "operatingExpenses";

export function LineItemsSection({
  name,
  section,
  title,
  description,
  nameLabel,
  namePlaceholder,
  amountLabel,
  monthly,
  addLabel,
  suggestions,
  emptyText,
  totals,
}: {
  name: ListName;
  section: SectionId;
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  amountLabel: string;
  monthly?: boolean;
  addLabel: string;
  suggestions: string[];
  emptyText: string;
  totals: ReactNode;
}) {
  const { control } = useFormContext<UnderwritingFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name });
  const rows = useWatch({ control, name });
  const { issuesByPath, showAllErrors } = useWorkspace();
  const listIssue = issuesByPath.get(name);

  const used = new Set(rows.map((row) => row.label.trim().toLowerCase()));
  const available = suggestions
    .filter((s) => !used.has(s.toLowerCase()))
    .slice(0, 4);

  return (
    <SectionCard
      id={`section-${section}`}
      title={title}
      description={description}
      status={<SectionStatus sections={[section]} />}
      footer={
        <>
          <Button
            variant="outline"
            size="lg"
            className="bg-card"
            onClick={() =>
              append(
                { label: "", amount: "" },
                { focusName: `${name}.${fields.length}.label` },
              )
            }
          >
            <PlusIcon data-icon="inline-start" />
            {addLabel}
          </Button>
          {available.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Suggestions</span>
              {available.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    append(
                      { label: suggestion, amount: "" },
                      { focusName: `${name}.${fields.length}.amount` },
                    )
                  }
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-input px-2.5 text-xs transition-colors hover:border-solid hover:bg-card"
                >
                  <PlusIcon className="size-3" aria-hidden />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="ml-auto flex gap-5 text-sm text-muted-foreground tabular-nums">
            {totals}
          </div>
        </>
      }
    >
      {fields.length === 0 ? (
        <p
          className={
            listIssue && showAllErrors
              ? "rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"
              : "rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground"
          }
          data-testid={`${name}-empty`}
        >
          {listIssue && showAllErrors ? listIssue.message : emptyText}
        </p>
      ) : (
        <table className="w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pr-2 font-medium">{nameLabel}</th>
              <th className="w-[36%] pr-2 font-medium">{amountLabel}</th>
              {monthly && (
                <th className="hidden w-[16%] pr-2 text-right font-medium sm:table-cell">
                  Annual
                </th>
              )}
              <th className="w-9">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const amount = parseInput(rows[index]?.amount);
              return (
                <tr key={field.id} className="align-top">
                  <td className="pr-2">
                    <TextField
                      name={`${name}.${index}.label`}
                      label={`${nameLabel}, line ${index + 1}`}
                      placeholder={namePlaceholder}
                    />
                  </td>
                  <td className="pr-2">
                    <NumericField
                      name={`${name}.${index}.amount`}
                      kind={monthly ? "monthly" : "money"}
                      label={`${amountLabel}, line ${index + 1}`}
                      placeholder="0"
                      hideLabel
                    />
                  </td>
                  {monthly && (
                    <td className="hidden h-9 pr-2 text-right align-middle text-sm text-muted-foreground tabular-nums sm:table-cell">
                      {formatCurrency(amount === null ? null : amount * 12)}
                    </td>
                  )}
                  <td>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="text-muted-foreground hover:bg-danger-soft hover:text-danger"
                      onClick={() => remove(index)}
                      aria-label={`Remove line ${index + 1}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}
