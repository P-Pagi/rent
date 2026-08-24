"use client";

import { STATUS_CONFIG, TimelineEntry, BookingStatus } from "@/types";
import { User } from "lucide-react";

interface TimelineProps {
  entries: TimelineEntry[];
  currentStatus?: BookingStatus;
}

export default function Timeline({ entries, currentStatus }: TimelineProps) {
  if (!entries || entries.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px 0",
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Belum ada riwayat status.
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sorted.map((entry, idx) => {
        const config  = STATUS_CONFIG[entry.status as BookingStatus];
        const isLast  = idx === sorted.length - 1;
        const isCurrent = entry.status === currentStatus && isLast;

        const dt = new Date(entry.createdAt);
        const dateStr = dt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const timeStr = dt.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={entry.id}
            className="animate-fade-in-up"
            style={{
              display: "flex",
              gap: 14,
              animationDelay: `${idx * 0.07}s`,
            }}
          >
            {/* ── Spine ──────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                flexShrink: 0,
              }}
            >
              {/* Node dot */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isCurrent
                    ? `linear-gradient(135deg, ${config.color}40, ${config.color}20)`
                    : "var(--bg-soft)",
                  border: `2px solid ${isCurrent ? config.color : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isCurrent ? `0 0 10px ${config.color}40` : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: config.color,
                    opacity: isCurrent ? 1 : 0.5,
                  }}
                />
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    background: `linear-gradient(to bottom, ${config.color}40, var(--border))`,
                    borderRadius: 2,
                    margin: "4px 0",
                  }}
                />
              )}
            </div>

            {/* ── Content ────────────────────────────────── */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20, paddingTop: 4 }}>
              {/* Status label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isCurrent ? config.color : "var(--text)",
                  }}
                >
                  {config.label}
                </span>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: `${config.color}18`,
                      color: config.color,
                      border: `1px solid ${config.color}30`,
                    }}
                  >
                    Saat ini
                  </span>
                )}
              </div>

              {/* Meta: admin + datetime */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: entry.comment ? 8 : 0,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={11} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>
                    {entry.updatedBy}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 500 }}>
                  {dateStr} · {timeStr}
                </span>
              </div>

              {/* Comment bubble */}
              {entry.comment && (
                <div
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    lineHeight: 1.5,
                    position: "relative",
                  }}
                >
                  {/* Arrow */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: -7,
                      width: 0,
                      height: 0,
                      borderTop: "5px solid transparent",
                      borderBottom: "5px solid transparent",
                      borderRight: "7px solid var(--border)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: -5,
                      width: 0,
                      height: 0,
                      borderTop: "5px solid transparent",
                      borderBottom: "5px solid transparent",
                      borderRight: "7px solid var(--bg-soft)",
                    }}
                  />
                  {entry.comment}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
