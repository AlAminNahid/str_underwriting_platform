import { CloudOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiError } from "@/services/api-client";

export function LoadError({
  title,
  error,
  onRetry,
  isRetrying,
  ...props
}: {
  title: string;
  error: unknown;
  onRetry: () => void;
  isRetrying: boolean;
} & Omit<React.ComponentProps<"div">, "title">) {
  return (
    <EmptyState
      icon={CloudOffIcon}
      title={title}
      description={
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again in a moment."
      }
      action={
        <Button size="lg" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? "Retrying…" : "Try again"}
        </Button>
      }
      {...props}
    />
  );
}
