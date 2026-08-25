"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell, CalendarCheck, Package, AlertTriangle, Clock,
  CheckCheck, ArrowRight, Filter, Search, Inbox,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

type NotifType = "new_booking" | "pickup_today" | "overdue" | "low_stock";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  detail: string;
  time: string;
  href: string;
  bookingId: string | null;
  customerName: string | null;
  costumeName: string | null;
}

interface Props {
  notifications: Notification[];
}

const TYPE_META: Record<NotifType, { icon: any; color: string; bg: string; label: string }> = {
  new_booking:  { icon: CalendarCheck, color: "#2563EB", bg: "rgba(37,99,235,0.10)",  label: "Booking Baru" },
  pickup_today: { icon: Package,       color: "#0284C7", bg: "rgba(2,132,199,0.10)",  label: "Pengambilan" },
  overdue:      { icon: AlertTriangle, color: "#DC2626", bg: "rgba(220,38,38,0.10)",  label: "Terlambat" },
  low_stock:    { icon: Clock,         color: "#B45309", bg: "rgba(180,83,9,0.10)",   label: "Stok Rendah" },
};

const TABS = [
  { key: "all",          label: "Semua",        icon: Bell },
  { key: "new_booking",  label: "Booking Baru", icon: CalendarCheck },
  { key: "pickup_today", label: "Pengambilan",  icon: Package },
  { key: "overdue",      label: "Terlambat",    icon: AlertTriangle },
  { key: "low_stock",    label: "Stok Rendah",  icon: Clock },
] as const;

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function NotificationsClient({ notifications }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | NotifType>("all");
  const [readIds, setReadIds]     = useState<Set<string>>(new Set());
  const [search, setSearch]       = useState("");
  const NOTIF_STORAGE_KEY = "hana_notifications_read_ids";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setReadIds(new Set(parsed));
      }
    } catch {
    }
  }, [NOTIF_STORAGE_KEY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(Array.from(readIds)));
  }, [readIds, NOTIF_STORAGE_KEY]);

  const markAllRead = () => {
    const next = new Set(notifications.map((n) => n.id));
    setReadIds(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(Array.from(next)));
    }
  };

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== "undefined") {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const filtered = notifications.filter((n) => {
    const matchTab    = activeTab === "all" || n.type === activeTab;
    const matchSearch = !search || [n.body, n.title, n.detail].some((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    );
    return matchTab && matchSearch;
  });

  const unread = notifications.filter((n) => !readIds.has(n.id)).length;

  const countByType = (type: NotifType) =>
    notifications.filter((n) => n.type === type && !readIds.has(n.id)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Pusat Notifikasi"
        subtitle="Pantau semua aktivitas penting — booking baru, pengambilan, keterlambatan, dan stok."
        emoji="🔔"
        action={
          unread > 0 ? (
            <button onClick={markAllRead} className="btn-ghost" style={{ gap: 6, fontSize: 13 }}>
              <CheckCheck size={14} />
              Tandai semua dibaca ({unread})
            </button>
          ) : undefined
        }
      />

      {/* ── Summary Cards ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
        }}
      >
        {(["new_booking", "pickup_today", "overdue", "low_stock"] as NotifType[]).map((type) => {
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          const count = notifications.filter((n) => n.type === type).length;
          const unreadCount = countByType(type);
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              style={{
                background: activeTab === type ? meta.bg : "var(--card)",
                border: `1px solid ${activeTab === type ? meta.color + "40" : "var(--border)"}`,
                borderRadius: 18,
                padding: "16px 18px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                boxShadow: activeTab === type ? `0 4px 16px ${meta.color}22` : "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color={meta.color} />
                </div>
                {unreadCount > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: meta.color, background: meta.bg, borderRadius: 99, padding: "2px 8px" }}>
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: meta.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>{meta.label}</div>
            </button>
          );
        })}
      </div>

      {/* ── Main Panel ────────────────────────────────────────── */}
      <div className="kawaii-card" style={{ overflow: "hidden" }}>
        {/* Toolbar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {TABS.map(({ key, label, icon: Icon }) => {
              const count = key === "all"
                ? notifications.filter((n) => !readIds.has(n.id)).length
                : countByType(key as NotifType);
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                    border: activeTab === key ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: activeTab === key ? "var(--primary)" : "var(--bg-soft)",
                    color: activeTab === key ? "white" : "var(--text-muted)",
                  }}
                >
                  <Icon size={12} />
                  {label}
                  {count > 0 && (
                    <span
                      style={{
                        background: activeTab === key ? "rgba(255,255,255,0.25)" : "var(--border)",
                        borderRadius: 99, fontSize: 10, fontWeight: 800,
                        padding: "0 6px", minWidth: 18, textAlign: "center",
                        color: activeTab === key ? "white" : "var(--text-muted)",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: "relative", minWidth: 200 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-soft)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari notifikasi…"
              style={{
                width: "100%", height: 34, paddingLeft: 30, paddingRight: 12,
                borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--bg-soft)", color: "var(--text)",
                fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              <Inbox size={40} style={{ margin: "0 auto 12px", opacity: 0.25 }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Tidak ada notifikasi</p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--text-soft)" }}>
                {search ? "Coba kata kunci berbeda." : "Semua sudah beres! ✨"}
              </p>
            </div>
          ) : (
            filtered.map((n, i) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              const isRead = readIds.has(n.id);
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => markRead(n.id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 16,
                    padding: "16px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-soft)" : "none",
                    textDecoration: "none",
                    background: isRead ? "transparent" : `${meta.color}08`,
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isRead ? "transparent" : `${meta.color}08`)}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${meta.color}25`,
                  }}>
                    <Icon size={18} color={meta.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 800, textTransform: "uppercase",
                        letterSpacing: "0.04em", color: meta.color,
                        background: meta.bg, borderRadius: 6, padding: "1px 7px",
                      }}>
                        {meta.label}
                      </span>
                      {!isRead && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0, boxShadow: `0 0 6px ${meta.color}` }} />
                      )}
                    </div>
                    <p style={{ margin: "0 0 3px", fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>
                      {n.body}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                      {n.detail}
                    </p>
                  </div>

                  {/* Time + arrow */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {n.type === "pickup_today" ? "Hari Ini" : timeAgo(n.time)}
                    </span>
                    <ArrowRight size={14} style={{ color: "var(--text-soft)", opacity: 0.5 }} />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-soft)", fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600, textAlign: "center" }}>
            Menampilkan {filtered.length} notifikasi
            {search && ` untuk "${search}"`}
          </div>
        )}
      </div>
    </div>
  );
}
