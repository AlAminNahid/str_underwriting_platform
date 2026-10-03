import { MapPinOffIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <EmptyState
        icon={MapPinOffIcon}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link
            href={ROUTES.dashboard}
            className={buttonVariants({ size: "lg" })}
          >
            Back to dashboard
          </Link>
        }
      />
    </main>
  );
}
