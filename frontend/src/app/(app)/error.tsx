"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="py-0">
      <EmptyState
        icon={TriangleAlertIcon}
        title="Something went wrong on this page"
        description="Try again. If it keeps happening, check that the backend is running."
        action={
          <Button size="lg" onClick={() => retry()}>
            Try again
          </Button>
        }
      />
    </Card>
  );
}
