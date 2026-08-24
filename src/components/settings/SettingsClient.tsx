"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Moon,
  Sun,
  User,
  Bell,
  Database,
  ExternalLink,
  Sparkles,
  Shield,
} from "lucide-react";
import { useProfile } from "@/components/profile/ProfileProvider";

interface SyncLog {
  id: string;
  syncedAt: string;
  status: string;
  recordsSynced: number;
  errorLog?: string | null;
}

export default function SettingsClient() {
  const [dark, setDark] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{
    success: boolean;
    message: string;
    duration?: number;
    recordsSynced?: number;
  } | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Admin profile fields
  const { profile, setProfile } = useProfile();
  const [adminName, setAdminName] = useState(profile.name);
  const [adminEmail, setAdminEmail] = useState(profile.email);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification toggles
  const [notifBookingBaru, setNotifBookingBaru] = useState(true);
  const [notifPembayaran, setNotifPembayaran] = useState(true);
  const [notifPengembalian, setNotifPengembalian] = useState(false);

  // Load sync logs
  useEffect(() => {
    fetch("/api/sync")
      .then((r) => r.json())
      .then((data) => setSyncLogs(data.logs || []))
      .catch(() => { })
      .finally(() => setLoadingLogs(false));
  }, [lastSync]);

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

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kawaii-dark", String(next));
  };

  const handleSync = async () => {
    setSyncing(true);
    setLastSync(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      setLastSync({
        success: data.success,
        message: data.message,
        duration: data.duration,
        recordsSynced: data.recordsSynced,
      });
    } catch {
      setLastSync({ success: false, message: "Gagal terhubung ke server." });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 800));
    setProfile({ name: adminName, email: adminEmail });
    setProfileSaved(true);
    setSavingProfile(false);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* ── Google Sheets Sync Panel ──────────────────────────── */}
      <div className="kawaii-card animate-fade-in-up" style={{ padding: 28 }}>
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
            <Database size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Sinkronisasi Google Sheets</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Tarik data booking terbaru dari Google Form
            </p>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary"
          style={{
            width: "100%",
            height: 44,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <RefreshCw size={15} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
          {syncing ? "Sedang Sinkronisasi…" : "Sinkronisasi Sekarang"}
        </button>

        {/* Sync status result */}
        {lastSync && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: lastSync.success ? "rgba(134,239,172,0.12)" : "rgba(252,165,165,0.12)",
              border: `1px solid ${lastSync.success ? "rgba(134,239,172,0.30)" : "rgba(252,165,165,0.30)"}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {lastSync.success ? (
              <CheckCircle2 size={16} style={{ color: "#15803D", flexShrink: 0, marginTop: 1 }} />
            ) : (
              <XCircle size={16} style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }} />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: lastSync.success ? "#15803D" : "#DC2626" }}>
                {lastSync.success ? "Sync Berhasil" : "Sync Gagal"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {lastSync.message}
              </div>
              {lastSync.success && (
                <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 4 }}>
                  ⏱ {lastSync.duration}ms • {lastSync.recordsSynced} records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Sheets Link */}
        <a
          href="https://docs.google.com/spreadsheets"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--primary)",
            textDecoration: "none",
            marginBottom: 20,
          }}
        >
          <ExternalLink size={13} /> Buka Google Sheets
        </a>

        {/* Sync History Table */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
            Riwayat Sinkronisasi
          </h3>
          {loadingLogs ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Memuat riwayat…</div>
          ) : syncLogs.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Belum ada riwayat sync. Klik tombol di atas untuk mulai.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {log.status === "SUCCESS" ? (
                      <CheckCircle2 size={14} style={{ color: "#15803D" }} />
                    ) : (
                      <XCircle size={14} style={{ color: "#DC2626" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: log.status === "SUCCESS" ? "#15803D" : "#DC2626" }}>
                      {log.status === "SUCCESS" ? `${log.recordsSynced} records synced` : "Sync gagal"}
                    </div>
                    {log.errorLog && (
                      <div style={{ fontSize: 11, color: "#DC2626", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.errorLog}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-soft)", flexShrink: 0 }}>
                    <Clock size={11} />
                    {new Date(log.syncedAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Appearance */}
        <div className="kawaii-card animate-fade-in-up delay-100" style={{ padding: 28 }}>
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
        <div className="kawaii-card animate-fade-in-up delay-200" style={{ padding: 28 }}>
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
            { label: "Booking Baru Masuk", desc: "Notifikasi saat Google Form disubmit", value: notifBookingBaru, set: setNotifBookingBaru },
            { label: "Konfirmasi Pembayaran", desc: "Saat customer upload bukti transfer", value: notifPembayaran, set: setNotifPembayaran },
            { label: "Batas Pengembalian", desc: "Reminder H-1 pengembalian kostum", value: notifPengembalian, set: setNotifPengembalian },
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
                onClick={() => item.set(!item.value)}
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

        {/* Profile Settings */}
        <div className="kawaii-card animate-fade-in-up delay-300" style={{ padding: 28 }}>
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
        <div className="kawaii-card animate-fade-in-up delay-500" style={{ padding: 20 }}>
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
