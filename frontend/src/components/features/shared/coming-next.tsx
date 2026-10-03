import { HammerIcon } from "lucide-react";
import Link from "next/link";

import { PageBreadcrumbs, type Crumb } from "@/components/layouts/breadcrumbs";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants/routes";

export function ComingNext({
  title,
  breadcrumbs,
}: {
  title: string;
  breadcrumbs: Crumb[];
}) {
  return (
    <>
      <PageBreadcrumbs items={breadcrumbs} />
      <PageHeader title={title} />
      <Card className="py-0">
        <EmptyState
          icon={HammerIcon}
          title="This screen is coming next"
          description="It will be built in the next step of the assessment."
          action={
            <Link
              href={ROUTES.dashboard}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Back to dashboard
            </Link>
          }
        />
      </Card>
    </>
  );
}
