"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  name: string;
  total: number;
  selesai: number;
}

interface BookingChartProps {
  data: MonthlyData[];
}

export default function BookingChart({ data }: BookingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#86EFAC" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#86EFAC" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Total Booking"
          stroke="#8B5CF6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
        <Area
          type="monotone"
          dataKey="selesai"
          name="Selesai"
          stroke="#86EFAC"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorSelesai)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
