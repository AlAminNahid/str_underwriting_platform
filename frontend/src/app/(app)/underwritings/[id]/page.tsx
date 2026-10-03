import { ComingNext } from "@/components/features/shared/coming-next";
import { ROUTES } from "@/constants/routes";

export default function UnderwritingPage() {
  return (
    <ComingNext
      title="Underwriting workspace"
      breadcrumbs={[
        { label: "Dashboard", href: ROUTES.dashboard },
        { label: "Underwriting" },
      ]}
    />
  );
}
