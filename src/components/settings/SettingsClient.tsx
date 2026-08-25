"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Moon,
  Sun,
  User,
  Bell,
  Sparkles,
  Shield,
} from "lucide-react";
import { useProfile } from "@/components/profile/ProfileProvider";

export default function SettingsClient() {
  const [dark, setDark] = useState(false);

  // Admin profile fields
  const { profile, setProfile } = useProfile();
  const [adminName, setAdminName] = useState(profile.name);
  const [adminEmail, setAdminEmail] = useState(profile.email);
  const [adminPassword, setAdminPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification toggles
  const [notifBookingBaru, setNotifBookingBaru] = useState(true);
  const [notifPembayaran, setNotifPembayaran] = useState(true);
  const [notifPengembalian, setNotifPengembalian] = useState(false);

  useEffect(() => {
    setAdminName(profile.name);
    setAdminEmail(profile.email);
  }, [profile]);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("kawaii-dark");
    if (saved === "true") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Notification settings persistence
  useEffect(() => {
    const saved = localStorage.getItem("hana_notif_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.booking === "boolean") setNotifBookingBaru(parsed.booking);
        if (typeof parsed.payment === "boolean") setNotifPembayaran(parsed.payment);
        if (typeof parsed.return === "boolean") setNotifPengembalian(parsed.return);
      } catch {
        // ignore
      }
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kawaii-dark", String(next));
  };

  const handleToggleNotif = (type: "booking" | "payment" | "return", currentVal: boolean) => {
    const nextVal = !currentVal;
    let nextBooking = notifBookingBaru;
    let nextPayment = notifPembayaran;
    let nextReturn = notifPengembalian;

    if (type === "booking") {
      setNotifBookingBaru(nextVal);
      nextBooking = nextVal;
    } else if (type === "payment") {
      setNotifPembayaran(nextVal);
      nextPayment = nextVal;
    } else if (type === "return") {
      setNotifPengembalian(nextVal);
      nextReturn = nextVal;
    }

    localStorage.setItem(
      "hana_notif_settings",
      JSON.stringify({ booking: nextBooking, payment: nextPayment, return: nextReturn })
    );
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 800));
    setProfile({ name: adminName, email: adminEmail });
    if (adminPassword) {
      localStorage.setItem("hana_admin_password", adminPassword);
    }
    setProfileSaved(true);
    setSavingProfile(false);
    setAdminPassword("");
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: 24,
        alignItems: "start",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* ── Left Column: Appearance & Notifications ──────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Appearance */}
        <div className="kawaii-card animate-fade-in-up" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(249,168,212,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-dark)",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Tampilan</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Tema Light / Dark Ocean Mode
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: 14,
              background: "var(--bg-soft)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {dark ? <Moon size={16} style={{ color: "var(--primary)" }} /> : <Sun size={16} style={{ color: "#B45309" }} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {dark ? "🌊 Dark Ocean Mode" : "☀️ Ocean Light Mode"}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  {dark ? "Mode malam yang elegan" : "Mode siang yang cerah dan pastel"}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={toggleDark}
              style={{
                width: 48,
                height: 26,
                borderRadius: 99,
                border: "none",
                background: dark ? "var(--primary)" : "var(--border)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.3s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: dark ? 24 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.20)",
                  transition: "left 0.3s",
                }}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="kawaii-card animate-fade-in-up delay-100" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(190,227,248,0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563EB",
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Notifikasi</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Pilih event yang ingin kamu pantau
              </p>
            </div>
          </div>

          {[
            { label: "Booking Baru Masuk", desc: "Notifikasi saat ada pesanan baru", value: notifBookingBaru, type: "booking" as const },
            { label: "Konfirmasi Pembayaran", desc: "Saat customer upload bukti transfer", value: notifPembayaran, type: "payment" as const },
            { label: "Batas Pengembalian", desc: "Reminder H-1 pengembalian kostum", value: notifPengembalian, type: "return" as const },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{item.desc}</div>
              </div>
              <button
                onClick={() => handleToggleNotif(item.type, item.value)}
                style={{
                  width: 42,
                  height: 23,
                  borderRadius: 99,
                  border: "none",
                  background: item.value ? "var(--primary)" : "var(--border)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.3s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2.5,
                    left: item.value ? 21 : 2.5,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
                    transition: "left 0.3s",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Column: Profile Settings & Info ────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Settings */}
        <div className="kawaii-card animate-fade-in-up delay-200" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(139,92,246,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Profil Admin</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Informasi akun administrator dashboard
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Nama Admin", value: adminName, set: setAdminName, type: "text" },
              { label: "Email Admin", value: adminEmail, set: setAdminEmail, type: "email" },
            ].map((field) => (
              <div key={field.label}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  style={{
                    width: "100%",
                    height: 38,
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border)",
                    background: "var(--bg-soft)",
                    color: "var(--text)",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            ))}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Password Baru (opsional)
              </label>
              <input
                type="password"
                placeholder="Kosongkan jika tidak ingin ganti password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border)",
                  background: "var(--bg-soft)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="btn-primary"
              style={{
                height: 40,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              {profileSaved ? (
                <>
                  <CheckCircle2 size={14} /> Tersimpan!
                </>
              ) : savingProfile ? (
                "Menyimpan…"
              ) : (
                "Simpan Profil"
              )}
            </button>
          </div>
        </div>

        {/* About / Version */}
        <div className="kawaii-card animate-fade-in-up delay-300" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg, #8B5CF6, #F9A8D4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                Noy.Rentcos Admin v1.0.0
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                Next.js 16 · Prisma · MySQL · Tailwind CSS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
