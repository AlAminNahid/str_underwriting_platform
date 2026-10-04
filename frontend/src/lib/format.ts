const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatCurrency(value: number | null | undefined): string {
  return value == null ? "—" : currency.format(value);
}

export function formatCompactCurrency(
  value: number | null | undefined,
): string {
  return value == null ? "—" : compactCurrency.format(value);
}

export function formatInteger(value: number | null | undefined): string {
  return value == null ? "—" : integer.format(value);
}

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(value: Date | null | undefined): string {
  return value == null || Number.isNaN(value.getTime())
    ? "—"
    : shortDate.format(value);
}

const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(value: Date | null | undefined): string {
  return value == null || Number.isNaN(value.getTime())
    ? "—"
    : dateTime.format(value);
}

export function formatPercent(
  fraction: number | null | undefined,
  digits = 1,
): string {
  return fraction == null ? "—" : `${(fraction * 100).toFixed(digits)}%`;
}

export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  const text = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
