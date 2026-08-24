import PageHeader from "@/components/shared/PageHeader";
import StatisticsClient from "@/components/statistics/StatisticsClient";
import { getStatisticsData } from "@/app/actions/calendar-stats";

export const revalidate = 0;

export default async function StatisticsPage() {
  const data = await getStatisticsData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Statistik & Analisis Bisnis"
        subtitle="Grafik performa rental, popularitas produk, estimasi omset, dan tren pertumbuhan pelanggan."
        emoji="📊"
      />

      <StatisticsClient data={data as any} />
    </div>
  );
}
