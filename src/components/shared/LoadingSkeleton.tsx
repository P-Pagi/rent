// Skeleton primitives – compose these to build page-specific skeletons

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: React.CSSProperties;
}

// ── Atom ─────────────────────────────────────────────────────────────────
export function SkeletonBox({ width = "100%", height = 16, radius = 12, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

// ── Dashboard card skeleton ────────────────────────────────────────────
export function DashboardCardSkeleton() {
  return (
    <div className="kawaii-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonBox width={40} height={40} radius={14} />
        <SkeletonBox width={60} height={20} radius={8} />
      </div>
      <SkeletonBox width="55%" height={32} radius={10} />
      <SkeletonBox width="75%" height={14} radius={8} />
    </div>
  );
}

// ── Table row skeleton ─────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <SkeletonBox height={14} radius={8} width={i === 0 ? "80%" : "60%"} />
        </td>
      ))}
    </tr>
  );
}

// ── Costume card skeleton ──────────────────────────────────────────────
export function CostumeCardSkeleton() {
  return (
    <div className="kawaii-card" style={{ overflow: "hidden" }}>
      <SkeletonBox height={200} radius={0} style={{ borderRadius: "24px 24px 0 0" }} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="50%" height={12} />
        <div style={{ display: "flex", gap: 8 }}>
          <SkeletonBox width={48} height={22} radius={99} />
          <SkeletonBox width={48} height={22} radius={99} />
          <SkeletonBox width={48} height={22} radius={99} />
        </div>
      </div>
    </div>
  );
}

// ── Customer card skeleton ─────────────────────────────────────────────
export function CustomerCardSkeleton() {
  return (
    <div className="kawaii-card" style={{ padding: 20, display: "flex", gap: 14 }}>
      <SkeletonBox width={44} height={44} radius={14} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <SkeletonBox width="60%" height={14} />
        <SkeletonBox width="45%" height={12} />
        <SkeletonBox width="35%" height={12} />
      </div>
    </div>
  );
}

// ── Timeline skeleton ──────────────────────────────────────────────────
export function TimelineSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <SkeletonBox width={32} height={32} radius="50%" />
            {i < rows - 1 && <SkeletonBox width={2} height={40} radius={2} />}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
            <SkeletonBox width="55%" height={13} />
            <SkeletonBox width="35%" height={11} />
            <SkeletonBox width="80%" height={11} />
          </div>
        </div>
      ))}
    </div>
  );
}
