import { AtSign, Phone, MapPin, Calendar } from "lucide-react";
import { Customer } from "@/types";

interface CustomerCardProps {
  customer: Customer;
  lastBookingDate?: string | null;
  onClick?: (customer: Customer) => void;
}

// Generate consistent avatar colour from name
function avatarColor(name: string) {
  const colors = [
    ["#C4B5FD", "#6D28D9"],
    ["#F9A8D4", "#BE185D"],
    ["#BEE3F8", "#1D4ED8"],
    ["#86EFAC", "#15803D"],
    ["#FCD34D", "#B45309"],
    ["#FCA5A5", "#B91C1C"],
  ];
  const i = name.charCodeAt(0) % colors.length;
  return colors[i];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function CustomerCard({ customer, lastBookingDate, onClick }: CustomerCardProps) {
  const [light, dark] = avatarColor(customer.name);

  return (
    <div
      className="kawaii-card"
      onClick={() => onClick?.(customer)}
      style={{
        padding: 20,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${light}, ${dark})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 700,
          color: "white",
          flexShrink: 0,
          letterSpacing: "0.05em",
        }}
      >
        {initials(customer.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {customer.name}
          </h3>

          {/* Rental count badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 99,
              background: customer.totalRentals > 0
                ? "rgba(139,92,246,0.12)"
                : "rgba(156,163,175,0.12)",
              color: customer.totalRentals > 0 ? "var(--primary)" : "var(--text-muted)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {customer.totalRentals}× sewa
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AtSign size={12} style={{ color: "var(--accent-dark)", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 12,
                color: "var(--primary)",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {customer.instagram}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Phone size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
              {customer.phone}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <MapPin size={12} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }} />
            <span
              style={{
                fontSize: 11.5,
                color: "var(--text-muted)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {customer.address}
            </span>
          </div>

          {lastBookingDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <Calendar size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 500 }}>
                Terakhir sewa:{" "}
                {new Date(lastBookingDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
