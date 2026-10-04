import type { Metadata } from "next";

import { PropertyView } from "@/components/features/property/property-view";

export const metadata: Metadata = { title: "Property" };

export default async function PropertyPage({
  params,
}: PageProps<"/properties/[zpid]">) {
  const { zpid } = await params;
  return <PropertyView zpid={zpid} />;
}
