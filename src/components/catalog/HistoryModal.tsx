"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Search, AtSign, CreditCard, Loader2, HelpCircle, Info, Calendar } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInstagram?: string;
}

const extractFirstImageUrl = (imageUrl: string | null) =>
  imageUrl?.split(",").map((url) => url.trim()).filter(Boolean)[0] ?? null;

export default function HistoryModal({ isOpen, onClose, initialInstagram = "" }: HistoryModalProps) {
  const [historyInstagram, setHistoryInstagram] = useState(initialInstagram);
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearched, setHistorySearched] = useState(false);

  useEffect(() => {
    if (isOpen && initialInstagram) {
      setHistoryInstagram(initialInstagram);
      handleFetchHistory(initialInstagram);
    }
  }, [isOpen, initialInstagram]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleFetchHistory = async (igVal?: string) => {
    const targetIg = igVal || historyInstagram;
    if (!targetIg.trim()) return;
    setHistoryLoading(true);
    setHistorySearched(true);
    try {
      const res = await fetch(`/api/public/bookings?instagram=${encodeURIComponent(targetIg)}`);
      const data = await res.json();
      if (data.found) {
        setHistoryBookings(data.bookings || []);
      } else {
        setHistoryBookings([]);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusLabelAndColor = (status: string) => {
    switch (status) {
      case "BOOKING_BARU":
        return { text: "Booking Baru", bg: "rgba(236,72,153,0.06)", color: "#EC4899", border: "1px solid rgba(236,72,153,0.15)" };
      case "MENUNGGU_KONFIRMASI":
        return { text: "Menunggu Konfirmasi", bg: "rgba(245,158,11,0.06)", color: "#B45309", border: "1px solid rgba(180,83,9,0.15)" };
      case "MENUNGGU_PEMBAYARAN":
        return { text: "Menunggu Pembayaran", bg: "rgba(245,158,11,0.06)", color: "#D97706", border: "1px solid rgba(245,158,11,0.15)" };
      case "SUDAH_DIBAYAR":
        return { text: "Sudah Dibayar", bg: "rgba(21,128,61,0.06)", color: "#15803D", border: "1px solid rgba(21,128,61,0.15)" };
      case "KOSTUM_DISIAPKAN":
        return { text: "Kostum Disiapkan", bg: "rgba(190,24,93,0.06)", color: "#BE185D", border: "1px solid rgba(190,24,93,0.15)" };
      case "SUDAH_DIAMBIL":
        return { text: "Sudah Diambil", bg: "rgba(109,40,217,0.06)", color: "#6D28D9", border: "1px solid rgba(109,40,217,0.15)" };
      case "SEDANG_DISEWA":
        return { text: "Sedang Disewa", bg: "rgba(109,40,217,0.08)", color: "#6D28D9", border: "1px solid rgba(109,40,217,0.20)" };
      case "SUDAH_DIKEMBALIKAN":
        return { text: "Sudah Dikembalikan", bg: "rgba(190,24,93,0.06)", color: "#BE185D", border: "1px solid rgba(190,24,93,0.15)" };
      case "SELESAI":
        return { text: "Selesai", bg: "rgba(16,185,129,0.10)", color: "#10B981", border: "1px solid rgba(16,185,129,0.20)" };
      case "DIBATALKAN":
        return { text: "Dibatalkan", bg: "rgba(239,68,68,0.06)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" };
      // legacy statuses
      case "DIANTAR":
        return { text: "Sedang Dikirim", bg: "rgba(245,158,11,0.06)", color: "#D97706", border: "1px solid rgba(245,158,11,0.15)" };
      case "DITERIMA":
        return { text: "Sedang Dipakai", bg: "rgba(16,185,129,0.06)", color: "#059669", border: "1px solid rgba(16,185,129,0.15)" };
      case "DIKEMBALIKAN":
        return { text: "Dikembalikan (Dicek)", bg: "rgba(139,92,246,0.06)", color: "#7C3AED", border: "1px solid rgba(139,92,246,0.15)" };
      default:
        return { text: status, bg: "rgba(100,116,139,0.06)", color: "#64748B", border: "1px solid rgba(100,116,139,0.15)" };
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="modal-overlay-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,19,43,0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fade-in 0.15s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="kawaii-card modal-card-responsive"
        style={{
          width: "100%",
          maxWidth: 580,
          maxHeight: "85vh",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          animation: "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="modal-inner-scroll"
          style={{
            overflowY: "auto",
            maxHeight: "85vh",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "var(--card)",
            zIndex: 2,
          }}
        >
          <div>
            <h2 style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
              Riwayat Sewa Kamu
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              setHistorySearched(false);
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-soft)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "var(--bg-soft)",
              padding: 14,
              borderRadius: 16,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <AtSign size={12} style={{ color: "var(--primary)" }} />
                Masukkan Instagram Kamu
              </label>
              <input
                value={historyInstagram}
                onChange={(e) => setHistoryInstagram(e.target.value)}
                placeholder="Contoh: @username"
                style={inputStyle}
                onKeyDown={(e) => e.key === "Enter" && handleFetchHistory()}
              />
            </div>
            <button
              onClick={() => handleFetchHistory()}
              disabled={historyLoading}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background: "var(--primary)",
                color: "white",
                border: "none",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 38,
              }}
            >
              {historyLoading ? (
                <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Search size={13} />
              )}
              Cari
            </button>
          </div>

          {/* Bookings List Output */}
          {historyLoading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", color: "var(--primary)" }} />
              <p style={{ fontSize: 13, fontWeight: 600 }}>Memuat riwayat transaksi...</p>
            </div>
          ) : historySearched ? (
            historyBookings.length === 0 ? (
              <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--text-muted)" }}>
                <HelpCircle size={32} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Belum Ada Transaksi</p>
                <p style={{ fontSize: 12, color: "var(--text-soft)", margin: "4px 0 0" }}>
                  Tidak ditemukan riwayat penyewaan untuk akun Instagram {historyInstagram}.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {historyBookings.map((b) => {
                  const stat = getStatusLabelAndColor(b.status);
                  return (
                    <div
                      key={b.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        background: "var(--card)",
                        overflow: "hidden",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          background: "var(--bg-soft)",
                          borderBottom: "1px solid var(--border-soft)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>
                          ID: #{b.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 8,
                            background: stat.bg,
                            color: stat.color,
                            border: stat.border,
                          }}
                        >
                          {stat.text}
                        </span>
                      </div>

                      <div style={{ padding: 16, display: "flex", gap: 12 }}>
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "var(--bg-soft)",
                            position: "relative",
                            flexShrink: 0,
                            border: "1px solid var(--border-soft)",
                          }}
                        >
                          {extractFirstImageUrl(b.costume?.imageUrl ?? null) ? (
                            <Image
                              src={extractFirstImageUrl(b.costume?.imageUrl ?? null)!}
                              alt={b.costume?.name ?? "Costume"}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                              👘
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", margin: 0 }}>
                            {b.costume?.name}
                          </h4>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                            <span style={{ color: "var(--text)", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}> <Calendar size={13} />  {new Date(b.rentalStartDate).toLocaleDateString("id-ID")} - {new Date(b.rentalEndDate).toLocaleDateString("id-ID")}</span>
                            <span style={{ color: "var(--text)", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}> <CreditCard size={13} /> {b.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      {b.timeline && b.timeline.length > 0 && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderTop: "1px solid var(--border-soft)",
                            background: "rgba(250,252,255,0.4)",
                          }}
                        >
                          <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                            Catatan Perjalanan Kostum
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {b.timeline.map((t: any, idx: number) => (
                              <div key={idx} style={{ display: "flex", gap: 8, fontSize: 11.5, lineHeight: 1.4 }}>
                                <span style={{ color: "var(--primary)" }}>•</span>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: 700, color: "var(--text)" }}>
                                    {getStatusLabelAndColor(t.status).text}
                                  </span>
                                  {t.comment && <span style={{ color: "var(--text-muted)" }}> — {t.comment}</span>}
                                </div>
                                <span style={{ fontSize: 10, color: "var(--text-soft)", whiteSpace: "nowrap" }}>
                                  {new Date(t.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-muted)" }}>
              <Info size={28} style={{ margin: "0 auto 8px", color: "var(--primary)", opacity: 0.7 }} />
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Masukkan Username Instagram</p>
              <p style={{ fontSize: 12, color: "var(--text-soft)", margin: "4px 0 0" }}>
                Cari riwayat sewa Anda secara real-time untuk melihat status pengiriman, denda, dan konfirmasi laundry.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  fontSize: 12.5,
  fontWeight: 600,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
