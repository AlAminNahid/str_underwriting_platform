import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatInteger, humanize } from "@/lib/format";
import type { Property } from "@/types/training";

export function PropertyDetailsCard({ property: p }: { property: Property }) {
  const pricePerSqft =
    p.price !== null && p.areaSqft ? p.price / p.areaSqft : null;

  const rows: { label: string; value: string }[] = [
    { label: "List price", value: formatCurrency(p.price) },
    { label: "Price per sq ft", value: formatCurrency(pricePerSqft) },
    { label: "Days on market", value: p.timeOnMarket ?? "—" },
    { label: "Bedrooms", value: p.beds?.toString() ?? "—" },
    { label: "Bathrooms", value: p.baths?.toString() ?? "—" },
    {
      label: "Living area",
      value: p.areaSqft === null ? "—" : `${formatInteger(p.areaSqft)} sq ft`,
    },
    { label: "Home type", value: humanize(p.homeType) },
    { label: "Listing status", value: humanize(p.listingStatus) },
  ];

  return (
    <Card data-testid="property-details">
      <CardHeader>
        <CardTitle>Property details</CardTitle>
        <CardDescription>
          From the listing. The purchase price is filled in for you when you
          start.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map(({ label, value }) => (
            <div key={label} className="border-b py-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
