import { ReactNode, CSSProperties } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;          // accent colour (dot, value text, glow)
  trend?: {
    value: number;         // e.g. 12 for +12%
    label?: string;        // e.g. "vs. last month"
  };
  style?: CSSProperties;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  color = "#8B5CF6",
  trend,
  style,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      className="kawaii-card animate-fade-in-up"
      onClick={onClick}
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Soft radial glow in corner */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top row: icon + coloured dot */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {icon ? (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: `${color}15`,
              border: `1px solid ${color}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            {icon}
          </div>
        ) : (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}60`,
            }}
          />
        )}

        {/* Trend badge */}
        {trend && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              background: trend.value >= 0 ? "rgba(134,239,172,0.20)" : "rgba(252,165,165,0.20)",
              color: trend.value >= 0 ? "#15803D" : "#DC2626",
              border: `1px solid ${trend.value >= 0 ? "rgba(21,128,61,0.20)" : "rgba(220,38,38,0.20)"}`,
            }}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: color,
          lineHeight: 1,
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>

      {/* Title */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
        {trend?.label && (
          <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 2 }}>
            {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
