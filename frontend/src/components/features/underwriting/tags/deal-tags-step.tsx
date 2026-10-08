"use client";

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
import type { DealTagKey, UnderwritingFormValues } from "@/types/underwriting";

function TagOption({
  tagKey,
  label,
  description,
}: {
  tagKey: DealTagKey;
  label: string;
  description: string;
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
      </span>
    </label>
  );
}

export function DealTagsStep() {
  const { control, setValue } = useFormContext<UnderwritingFormValues>();
  const tags = useWatch({ control, name: "tags" });
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
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
