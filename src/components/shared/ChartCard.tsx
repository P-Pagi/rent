import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  minHeight?: number;
}

export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  style,
  minHeight = 280,
}: ChartCardProps) {
  return (
    <div
      className="kawaii-card"
      style={{
        padding: "20px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                margin: "2px 0 0",
                fontWeight: 500,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </div>

      {/* Chart area */}
      <div style={{ minHeight, flex: 1 }}>{children}</div>
    </div>
  );
}
