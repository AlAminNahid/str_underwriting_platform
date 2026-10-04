import { formatCurrency } from "@/lib/format";

export function CalculatedValues({
  items,
}: {
  items: { label: string; value: number | null | undefined }[];
}) {
  return (
    <dl
      className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border bg-muted/40 sm:grid-cols-4"
      aria-label="Calculated from your inputs"
    >
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="border-b px-3.5 py-2.5 odd:border-r sm:border-b-0 sm:not-last:border-r"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">
            {formatCurrency(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
