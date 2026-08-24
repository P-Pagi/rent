import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, emoji, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 28,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.2,
              marginBottom: subtitle ? 4 : 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
