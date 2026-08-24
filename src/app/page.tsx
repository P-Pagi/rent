import CatalogClient from "@/components/catalog/CatalogClient";
import { getCostumes } from "@/app/actions/catalog";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const costumes = await getCostumes();

  return <CatalogClient costumes={costumes} />;
}
