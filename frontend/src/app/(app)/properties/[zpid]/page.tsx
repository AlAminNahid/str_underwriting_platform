import { ComingNext } from "@/components/features/shared/coming-next";
import { ROUTES } from "@/constants/routes";

export default function PropertyPage() {
  return (
    <ComingNext
      title="Property"
      breadcrumbs={[
        { label: "Dashboard", href: ROUTES.dashboard },
        { label: "Property" },
      ]}
    />
  );
}
