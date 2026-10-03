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

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
