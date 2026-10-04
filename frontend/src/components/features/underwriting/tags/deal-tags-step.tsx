"use client";

import { SparklesIcon } from "lucide-react";
import { useController, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEAL_TAGS } from "@/constants/underwriting";
import { cn } from "@/lib/utils";
import type {
  DealTagKey,
  UnderwritingCalculation,
  UnderwritingFormValues,
} from "@/types/underwriting";

import { useWorkspace } from "../workspace-context";

function suggestionFor(
  key: DealTagKey,
  c: UnderwritingCalculation,
  coHostPct: string,
): string | null {
  const coc = c.scenarios.mid?.cashOnCash;
  if (key === "high_cash_on_cash" && coc != null && coc >= 8)
    return `Your Mid cash-on-cash is ${coc.toFixed(1)}%`;
  if (key === "low_cash_on_cash" && coc != null && coc < 3)
    return `Your Mid cash-on-cash is ${coc.toFixed(1)}%`;
  if (
    key === "can_support_cohost" &&
    Number(coHostPct) > 0 &&
    (c.scenarios.mid?.freeCashFlow ?? 0) > 0
  )
    return "Still cash-flow positive with a co-host";
  return null;
}

function TagOption({
  tagKey,
  label,
  description,
  suggestion,
}: {
  tagKey: DealTagKey;
  label: string;
  description: string;
  suggestion: string | null;
}) {
  const { control } = useFormContext<UnderwritingFormValues>();
  const { field } = useController({ control, name: `tags.${tagKey}` });
  const checked = Boolean(field.value);

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20",
        checked && "border-primary bg-primary/5",
      )}
      data-testid={`tag-${tagKey}`}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => field.onChange(value === true)}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
        {suggestion && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-gold/15 px-1.5 py-0.5 text-[11px] font-medium text-[#8a5512]">
            <SparklesIcon className="size-3" aria-hidden />
            Suggested · {suggestion}
          </span>
        )}
      </span>
    </label>
  );
}

export function DealTagsStep() {
  const { control, setValue } = useFormContext<UnderwritingFormValues>();
  const tags = useWatch({ control, name: "tags" });
  const coHostPct = useWatch({ control, name: "coHostingFeePct" });
  const { calculation } = useWorkspace();
  const selected = DEAL_TAGS.filter((t) => tags[t.key]).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal tags</CardTitle>
        <CardDescription>
          Labels that describe the deal at a glance. They don&apos;t affect your
          score.
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {selected} selected
          </span>
          {selected > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                DEAL_TAGS.forEach((t) =>
                  setValue(`tags.${t.key}`, false, { shouldDirty: true }),
                )
              }
            >
              Clear
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {DEAL_TAGS.map((tag) => (
            <TagOption
              key={tag.key}
              tagKey={tag.key}
              label={tag.label}
              description={tag.description}
              suggestion={suggestionFor(tag.key, calculation, coHostPct)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
