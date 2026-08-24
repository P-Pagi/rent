"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search, RefreshCw, Bell, Sun, Moon, User, ChevronDown, Menu,
  CalendarCheck, Package, Clock, AlertTriangle, CheckCheck, X,
  Settings, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  type: "new_booking" | "pickup_today" | "overdue" | "low_stock";
  title: string;
  body: string;
  time: string;
  href: string;
}

const TYPE_META = {
  new_booking: {
    icon: CalendarCheck,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.10)",
  },
  pickup_today: {
    icon: Package,
    color: "#0284C7",
    bg: "rgba(2,132,199,0.10)",
  },
  overdue: {
    icon: AlertTriangle,
    color: "#DC2626",
    bg: "rgba(220,38,38,0.10)",
  },
  low_stock: {
    icon: Clock,
    color: "#B45309",
    bg: "rgba(180,83,9,0.10)",
  },
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  const [dark, setDark] = useState(false);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile dropdown state
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const accountName = session?.user?.name ?? (session ? "Admin" : "Memuat...");
  const accountEmail = session?.user?.email ?? "admin@noyrent.cos";
  const unread = notifications.filter((n) => !readIds.has(n.id)).length;

  /** Persist read IDs to server */
  const saveReadIds = useCallback(async (ids: Set<string>) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readIds: Array.from(ids) }),
      });
    } catch {
      // silent — will be retried on next fetch
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      // Restore read IDs from server
      if (Array.isArray(data.readIds)) {
        setReadIds(new Set<string>(data.readIds));
      }
    } catch {
      // silent
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch on mount and every 60s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) {
      fetchNotifications();
    }
  };

  const markAllRead = () => {
    const nextIds = new Set(notifications.map((n) => n.id));
    setReadIds(nextIds);
    saveReadIds(nextIds);
  };

  const toggleDark = () => {
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  };


  return (
    <header
      style={{
        height: 64,
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* ── Hamburger (mobile only) ───────────────────────────────── */}
      <button
        className="navbar-hamburger"
        onClick={onMenuClick}
        aria-label="Open menu"
        style={{
          width: 36, height: 36, borderRadius: 12,
          border: "1px solid var(--border)", background: "var(--bg-soft)",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text-muted)", flexShrink: 0,
          transition: "all 0.2s",
        }}
      >
        <Menu size={18} />
      </button>

      {/* ── Page title ────────────────────────────────────────────── */}
      {title && (
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", marginRight: 8 }}>
          {title}
        </h1>
      )}

      {/* ── Search ────────────────────────────────────────────────── */}
      <div className="navbar-search" style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search bookings, customers, costumes…"
          style={{
            width: "100%", height: 36, paddingLeft: 36, paddingRight: 14,
            borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-soft)",
            color: "var(--text)", fontSize: 13, fontWeight: 500, fontFamily: "inherit",
            outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(236,72,153,0.10)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ flex: 1 }} />


      {/* ── Notifications ────────────────────────────────────────── */}
      <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          id="notif-bell"
          onClick={toggleNotif}
          style={{
            width: 36, height: 36, borderRadius: 12,
            border: `1px solid ${notifOpen ? "var(--primary-light)" : "var(--border)"}`,
            background: notifOpen ? "rgba(236,72,153,0.06)" : "var(--bg-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: notifOpen ? "var(--primary)" : "var(--text-muted)",
            position: "relative", transition: "all 0.2s",
          }}
          title="Notifications"
        >
          <Bell size={15} />
          {unread > 0 && (
            <span
              style={{
                position: "absolute", top: 5, right: 5,
                minWidth: 16, height: 16,
                borderRadius: 99,
                background: "var(--danger)",
                border: "2px solid var(--bg-soft)",
                fontSize: 9, fontWeight: 800,
                color: "#7f1d1d",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px",
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* ── Dropdown Panel ─────────────────────────────────── */}
        {notifOpen && (
          <div
            className="animate-scale-in notification-dropdown"
            style={{
              maxHeight: 480,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 18px 12px",
                borderBottom: "1px solid var(--border-soft)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={14} style={{ color: "var(--primary)" }} />
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>
                  Notifikasi
                </span>
                {unread > 0 && (
                  <span
                    style={{
                      background: "var(--primary)", color: "white",
                      borderRadius: 99, fontSize: 10, fontWeight: 800,
                      padding: "1px 7px",
                    }}
                  >
                    {unread} baru
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      fontSize: 11, fontWeight: 700, color: "var(--primary)",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "3px 8px", borderRadius: 8,
                      transition: "background 0.15s",
                    }}
                    title="Tandai semua dibaca"
                  >
                    <CheckCheck size={12} />
                    Tandai dibaca
                  </button>
                )}
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{
                    width: 26, height: 26, borderRadius: 8,
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-soft)",
                    cursor: "pointer", color: "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifLoading ? (
                <div style={{ padding: "28px 18px", textAlign: "center" }}>
                  <div className="skeleton" style={{ height: 14, width: "60%", margin: "0 auto 10px" }} />
                  <div className="skeleton" style={{ height: 14, width: "80%", margin: "0 auto 10px" }} />
                  <div className="skeleton" style={{ height: 14, width: "50%", margin: "0 auto" }} />
                </div>
              ) : notifications.length === 0 ? (
                <div
                  style={{
                    padding: "36px 18px", textAlign: "center",
                    color: "var(--text-muted)", fontSize: 13,
                  }}
                >
                  <Bell size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada notifikasi</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--text-soft)" }}>Semua beres! ✨</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  const isRead = readIds.has(n.id);
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        const next = new Set(readIds);
                        next.add(n.id);
                        setReadIds(next);
                        saveReadIds(next);
                        setNotifOpen(false);
                      }}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "12px 18px",
                        borderBottom: "1px solid var(--border-soft)",
                        textDecoration: "none",
                        background: isRead ? "transparent" : "rgba(236,72,153,0.03)",
                        transition: "background 0.15s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isRead ? "transparent" : "rgba(236,72,153,0.03)")}
                    >
                      {/* Icon badge */}
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                          background: meta.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: 1,
                        }}
                      >
                        <Icon size={16} color={meta.color} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
                            {n.title}
                          </span>
                          {!isRead && (
                            <span
                              style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "var(--primary)", flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                        <p
                          style={{
                            margin: 0, fontSize: 11.5, color: "var(--text-muted)",
                            fontWeight: 500, whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis",
                          }}
                        >
                          {n.body}
                        </p>
                        <span style={{ fontSize: 10.5, color: "var(--text-soft)", fontWeight: 600, marginTop: 3, display: "block" }}>
                          {timeAgo(n.time)}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                style={{
                  padding: "10px 18px",
                  borderTop: "1px solid var(--border-soft)",
                  flexShrink: 0,
                }}
              >
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  style={{
                    display: "block", textAlign: "center",
                    fontSize: 12, fontWeight: 700, color: "var(--primary)",
                    textDecoration: "none", padding: "6px",
                    borderRadius: 10, transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Lihat semua notifikasi →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dark Mode Toggle ──────────────────────────────────────────── */}
      <button
        onClick={toggleDark}
        style={{
          width: 36, height: 36, borderRadius: 12,
          border: "1px solid var(--border)", background: "var(--bg-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, transition: "all 0.2s",
        }}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* ── Admin Profile ─────────────────────────────────────────────── */}
      <div ref={profileRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setProfileOpen((p) => !p)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px 5px 5px", borderRadius: 12,
            border: `1px solid ${profileOpen ? "var(--primary-light)" : "var(--border)"}`,
            background: profileOpen ? "rgba(236,72,153,0.06)" : "var(--bg-soft)",
            cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
          }}
        >
          <div
            style={{
              width: 28, height: 28, borderRadius: 10,
              background: "linear-gradient(135deg, #2563EB, #38BDF8)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <User size={14} color="white" />
          </div>
          <span className="navbar-profile-name" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>
            {accountName}
          </span>
          <ChevronDown size={12} style={{ color: "var(--text-muted)", flexShrink: 0, transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {/* ── Profile Dropdown Panel ───────────────────────── */}
        {profileOpen && (
          <div
            className="animate-scale-in profile-dropdown"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              overflow: "hidden",
              padding: "6px 0",
            }}
          >
            {/* Header info */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-soft)", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{accountName}</div>
              <div style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 600, marginTop: 2 }}>{accountEmail}</div>
            </div>

            {/* Menu Items */}
            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", fontSize: 12.5, fontWeight: 600,
                color: "var(--text-muted)", textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-soft)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Settings size={14} />
              Pengaturan Profil
            </Link>

            <Link
              href="/notifications"
              onClick={() => setProfileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", fontSize: 12.5, fontWeight: 600,
                color: "var(--text-muted)", textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-soft)"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Bell size={14} />
              Semua Notifikasi
            </Link>

            <div style={{ height: 1, background: "var(--border-soft)", margin: "4px 0" }} />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", fontSize: 12.5, fontWeight: 700,
                color: "var(--danger)", border: "none", background: "transparent",
                cursor: "pointer", transition: "all 0.15s", textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(252,165,165,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={14} />
              Keluar / Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
