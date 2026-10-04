import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import type { MarketDetails, TrainingCase } from "@/types/training";

export function MarketCard({
  market,
  loading,
  failed,
  onRetry,
  sameMarket,
}: {
  market: MarketDetails | undefined;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
  sameMarket: TrainingCase[];
}) {
  return (
    <Card data-testid="market-card">
      <CardHeader>
        <CardTitle>Market context</CardTitle>
        <CardDescription>
          Properties in a market share the same demand patterns.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ) : failed || !market ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              We couldn&apos;t load the market details.
            </span>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="font-medium">{market.name}</p>
              {market.description && (
                <p className="mt-1 max-w-[70ch] text-sm text-foreground/80">
                  {market.description}
                </p>
              )}
            </div>
            <dl className="divide-y text-sm">
              <Row label="Region" value={market.region ?? "—"} />
              <Row
                label="Time zone"
                value={market.timezone?.replace("_", " ") ?? "—"}
              />
              <Row
                label="Other cases in this market"
                value={
                  sameMarket.length === 0 ? (
                    "None"
                  ) : (
                    <span className="flex flex-wrap justify-end gap-x-2">
                      {sameMarket.map((c) => (
                        <Link
                          key={c.zpid}
                          href={ROUTES.property(c.zpid)}
                          className="text-primary hover:underline"
                        >
                          {c.city ?? c.street}
                        </Link>
                      ))}
                    </span>
                  )
                }
              />
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
