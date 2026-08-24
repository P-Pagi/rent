import { STATUS_CONFIG, BookingStatus } from "@/types";

interface StatusBadgeProps {
  status: BookingStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={config.badgeClass}
      style={{
        fontSize: size === "sm" ? 11 : 12,
        padding:  size === "sm" ? "2px 8px" : "3px 10px",
      }}
    >
      {config.label}
    </span>
  );
}
