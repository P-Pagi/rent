"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Shirt,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/bookings",    label: "Bookings",     icon: CalendarDays },
  { href: "/customers",   label: "Customers",    icon: Users },
  { href: "/costumes",    label: "Costumes",     icon: Shirt },
  { href: "/calendar",    label: "Calendar",     icon: CalendarDays },
  { href: "/statistics",  label: "Statistics",   icon: BarChart3 },
  { href: "/settings",    label: "Settings",     icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 72 : 240,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        boxShadow: "var(--shadow-sm)",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "24px 20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid var(--border)",
          minHeight: 72,
          overflow: "hidden",
        }}
      >
        {/* Logo icon */}
        <img
          src="/image/logo.png"
          alt="noyrent.cos Logo"
          style={{
            width: 36,
            height: 36,
            objectFit: "contain",
            borderRadius: 8,
            flexShrink: 0,
          }}
        />

        {/* Brand text */}
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              noyrent.cos
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
              Cosplay Admin Panel
            </div>
          </div>
        )}
      </div>

      {/* ── Nav Items ─────────────────────────────────────── */}
      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              title={collapsed ? label : undefined}
              style={{ justifyContent: collapsed ? "center" : undefined }}
              onClick={onClose}
            >
              <Icon
                size={18}
                style={{
                  flexShrink: 0,
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  transition: "color 0.2s",
                }}
              />
              {!collapsed && (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{label}</span>
              )}
              {/* Active bubble indicator */}
              {isActive && !collapsed && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    flexShrink: 0,
                    boxShadow: "0 0 6px var(--primary)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ────────────────────────────────────────────── */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <button
          className="sidebar-item"
          style={{
            width: "100%",
            border: "none",
            background: "none",
            justifyContent: collapsed ? "center" : undefined,
            cursor: "pointer",
          }}
          title={collapsed ? "Logout" : undefined}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ color: "var(--danger)", whiteSpace: "nowrap" }}>Logout</span>
          )}
        </button>
      </div>

      {/* ── Collapse Toggle (desktop only) ──────────────────── */}
      <button
        className="sidebar-collapse-toggle"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          position: "absolute",
          top: "50%",
          right: -14,
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 50,
          transition: "box-shadow 0.2s",
          color: "var(--primary)",
        }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
