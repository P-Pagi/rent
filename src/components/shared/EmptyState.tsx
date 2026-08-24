interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  emoji = "🪼",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
        gap: 16,
      }}
    >
      {/* Floating jellyfish/emoji */}
      <div
        className="animate-float-jellyfish"
        style={{ fontSize: 56, lineHeight: 1, marginBottom: 4 }}
      >
        {emoji}
      </div>

      {/* Decorative circles */}
      <div style={{ position: "relative", width: 80, height: 4, marginBottom: 4 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-float-bubble"
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === 1 ? "var(--primary-light)" : "var(--accent)",
              left: `${i * 36}px`,
              top: 0,
              opacity: 0.5,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text)",
          margin: 0,
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 13.5,
            color: "var(--text-muted)",
            margin: 0,
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}

      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}
