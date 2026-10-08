"use client";

import { useId } from "react";
import { useController, useFormContext, type FieldPath } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UnderwritingFormValues } from "@/types/underwriting";

import { useWorkspace } from "../workspace-context";

export function TextField({
  name,
  label,
  placeholder,
}: {
  name: FieldPath<UnderwritingFormValues>;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const { control } = useFormContext<UnderwritingFormValues>();
  const {
    field: { ref, value, onChange, onBlur },
    fieldState,
  } = useController({ control, name });
  const { issuesByPath, showAllErrors } = useWorkspace();

  const issue = issuesByPath.get(name);
  const showError =
    Boolean(issue) &&
    (showAllErrors || (fieldState.isTouched && issue?.kind === "invalid"));

  return (
    <Field data-invalid={showError || undefined} className="gap-1.5">
      <FieldLabel htmlFor={id} className="sr-only">
        {label}
      </FieldLabel>
      <Input
        id={id}
        ref={ref}
        name={name}
        value={String(value ?? "")}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={showError || undefined}
        className="h-9 bg-card shadow-xs placeholder:text-muted-foreground/50"
        data-testid={`field-${name}`}
      />
      {showError && <FieldError>{issue?.message}</FieldError>}
    </Field>
  );
}
