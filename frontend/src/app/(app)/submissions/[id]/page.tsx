import type { Metadata } from "next";

import { ResultView } from "@/components/features/result/result-view";

export const metadata: Metadata = { title: "Evaluation result" };

export default async function SubmissionResultPage({
  params,
}: PageProps<"/submissions/[id]">) {
  const { id } = await params;
  return <ResultView id={Number(id)} />;
}
