"use client";

import ChartCard from "@/components/shared/ChartCard";
import DashboardCard from "@/components/shared/DashboardCard";
import { PaymentChart, PickupChart } from "@/components/dashboard/DistributionCharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface StatisticsClientProps {
  data: {
    totalBookings: number;
    totalRevenue: number;
    topCostumes: { name: string; popularity: number; stock: number }[];
    dailyDistribution: { day: string; total: number }[];
    paymentMethods: { name: string; value: number }[];
    pickupMethods: { name: string; value: number }[];
    customerGrowth: { date: string; total: number }[];
  };
}

export default function StatisticsClient({ data }: StatisticsClientProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        <DashboardCard
          title="Total Pendapatan"
          value={`Rp${data.totalRevenue.toLocaleString("id-ID")}`}
          subtitle="Estimasi omset akumulatif"
          color="#86EFAC"
        />
        <DashboardCard
          title="Total Transaksi Rental"
          value={data.totalBookings}
          subtitle="Booking tercatat di database"
          color="#8B5CF6"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {/* Top Costumes Popularity */}
        <ChartCard title="Kostum Terpopuler" subtitle="Peringkat kostum berdasarkan skor minat cosplayer">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.topCostumes} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderRadius: "14px", border: "1px solid var(--border)", fontSize: "12px" }} />
              <Bar dataKey="popularity" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Daily Distribution (Day of Week) */}
        <ChartCard title="Distribusi Hari Booking" subtitle="Frekuensi pemesanan berdasarkan hari dalam seminggu">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.dailyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderRadius: "14px", border: "1px solid var(--border)", fontSize: "12px" }} />
              <Bar dataKey="total" fill="#F9A8D4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Payment & Pickup Breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <ChartCard title="Sebaran Metode Pembayaran" subtitle="Persentase transfer bank vs e-wallet">
          <PaymentChart data={data.paymentMethods} />
        </ChartCard>

        <ChartCard title="Sebaran Metode Pengambilan" subtitle="Perbandingan ambil sendiri vs kurir instan">
          <PickupChart data={data.pickupMethods} />
        </ChartCard>
      </div>

      {/* Customer Growth Timeline */}
      <ChartCard title="Pertumbuhan Customer" subtitle="Jumlah kumulatif pelanggan terdaftar dari waktu ke waktu">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.customerGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderRadius: "14px", border: "1px solid var(--border)", fontSize: "12px" }} />
            <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB" }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
