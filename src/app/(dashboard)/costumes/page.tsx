import PageHeader from "@/components/shared/PageHeader";
import CostumesClient from "@/components/costumes/CostumesClient";
import { getCostumes } from "@/app/actions/catalog";
import { Costume } from "@/types";

export const revalidate = 0;

export default async function CostumesPage() {
  const costumes = await getCostumes();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Katalog & Inventaris Kostum"
        subtitle="Pantau jumlah stok, status ketersediaan, kostum sedang disewa, serta jadwal pemeliharaan."
        emoji="👘"
      />

      <CostumesClient initialCostumes={costumes as unknown as Costume[]} />
    </div>
  );
}
