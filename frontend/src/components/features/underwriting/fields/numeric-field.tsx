"use client";

import { useId, useState } from "react";
import { useController, useFormContext, type FieldPath } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { UnderwritingFormValues } from "@/types/underwriting";

import { useWorkspace } from "../workspace-context";

type Kind = "money" | "monthly" | "percent" | "years";

const ADDONS: Record<Kind, { prefix?: string; suffix?: string }> = {
  money: { prefix: "$" },
  monthly: { prefix: "$", suffix: "/ mo" },
  percent: { suffix: "%" },
  years: { suffix: "years" },
};

const grouping = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function sanitize(value: string) {
  return value.replace(/[$,%\s]/g, "");
}

function formatForDisplay(raw: string) {
  const n = Number(raw);
  return raw.trim() && Number.isFinite(n) ? grouping.format(n) : raw;
}

export function NumericField({
  name,
  kind,
  label,
  help,
  placeholder,
  graded = false,
  hideLabel = false,
}: {
  name: FieldPath<UnderwritingFormValues>;
  kind: Kind;
  label: string;
  help?: string;
  placeholder?: string;
  graded?: boolean;
  hideLabel?: boolean;
}) {
  const id = useId();
  const { control } = useFormContext<UnderwritingFormValues>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({ control, name });
  const { issuesByPath, showAllErrors } = useWorkspace();
  const [editing, setEditing] = useState(false);

  const issue = issuesByPath.get(name);
  const showError =
    Boolean(issue) &&
    (showAllErrors || (fieldState.isTouched && issue?.kind === "invalid"));
  const raw = String(value ?? "");
  const groupThousands = kind === "money" || kind === "monthly";
  const { prefix, suffix } = ADDONS[kind];

  return (
    <Field data-invalid={showError || undefined} className="gap-1.5">
      <FieldLabel htmlFor={id} className={cn(hideLabel && "sr-only")}>
        {label}
        {graded && (
          <span className="rounded-sm bg-gold/20 px-1.5 py-px text-[10px] font-semibold tracking-wide text-[#8a5512] uppercase">
            Graded
          </span>
        )}
      </FieldLabel>
      <InputGroup
        className={cn(
          "h-9 bg-card shadow-xs",
          graded && "border-gold ring-3 ring-gold/20",
        )}
      >
        {prefix && (
          <InputGroupAddon>
            <InputGroupText>{prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          ref={ref}
          name={name}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={groupThousands && !editing ? formatForDisplay(raw) : raw}
          onChange={(e) => {
            setEditing(true);
            onChange(sanitize(e.target.value));
          }}
          onBlur={() => {
            setEditing(false);
            onBlur();
          }}
          aria-invalid={showError || undefined}
          className="tabular-nums placeholder:text-muted-foreground/50"
          data-testid={`field-${name}`}
        />
        {suffix && (
          <InputGroupAddon align="inline-end">
            <InputGroupText>{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
      </InputGroup>
      {showError ? (
        <FieldError>{issue?.message}</FieldError>
      ) : (
        help && <FieldDescription className="text-xs">{help}</FieldDescription>
      )}
    </Field>
  );
}
