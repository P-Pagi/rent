"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DistributionItem {
  name: string;
  value: number;
}

interface PaymentChartProps {
  data: DistributionItem[];
}

const PASTEL_COLORS = ["#8B5CF6", "#F9A8D4", "#BEE3F8", "#FCD34D", "#86EFAC"];

export function PaymentChart({ data }: PaymentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)",
            fontSize: "12px",
            fontWeight: 600,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface PickupChartProps {
  data: DistributionItem[];
}

export function PickupChart({ data }: PickupChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)",
            fontSize: "12px",
            fontWeight: 600,
          }}
        />
        <Bar dataKey="value" fill="#BEE3F8" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
