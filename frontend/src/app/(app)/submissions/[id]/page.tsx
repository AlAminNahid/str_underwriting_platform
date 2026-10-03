import { ComingNext } from "@/components/features/shared/coming-next";
import { ROUTES } from "@/constants/routes";

export default function SubmissionResultPage() {
  return (
    <ComingNext
      title="Evaluation result"
      breadcrumbs={[
        { label: "Submissions", href: ROUTES.submissions },
        { label: "Result" },
      ]}
    />
  );
}
