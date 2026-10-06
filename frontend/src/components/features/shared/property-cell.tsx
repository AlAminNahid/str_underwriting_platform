import { PropertyImage } from "@/components/features/shared/property-image";
import type { TrainingCase } from "@/types/training";

export function PropertyCell({
  zpid,
  trainingCase,
}: {
  zpid: string;
  trainingCase: TrainingCase | undefined;
}) {
  const location = [
    [trainingCase?.city, trainingCase?.state].filter(Boolean).join(", "),
    trainingCase?.market?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span className="flex min-w-0 items-center gap-3">
      <PropertyImage
        src={trainingCase?.imageUrl ?? null}
        alt=""
        sizes="40px"
        className="size-10 shrink-0 rounded-md"
      />
      <span className="min-w-0">
        <span className="block truncate font-medium">
          {trainingCase?.street ?? `Property ${zpid}`}
        </span>
        {location && (
          <span className="block truncate text-xs text-muted-foreground">
            {location}
          </span>
        )}
      </span>
    </span>
  );
}
