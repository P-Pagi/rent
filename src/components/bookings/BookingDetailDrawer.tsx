"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Booking, BookingStatus, STATUS_CONFIG } from "@/types";
import StatusBadge from "@/components/shared/StatusBadge";
import Timeline from "@/components/shared/Timeline";
import { updateBookingStatus, updateBookingNotes } from "@/app/actions/booking";
import { useSession } from "next-auth/react";
import {
  X,
  User,
  AtSign,
  Phone,
  MapPin,
  Shirt,
  Calendar,
  CreditCard,
  Truck,
  ExternalLink,
  Save,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface BookingDetailDrawerProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdated?: () => void;
}

const ALL_STATUSES: BookingStatus[] = [
  "BOOKING_BARU",
  "SUDAH_DIBAYAR",
  "KOSTUM_DISIAPKAN",
  "SUDAH_DIAMBIL",
  "SEDANG_DISEWA",
  "SUDAH_DIKEMBALIKAN",
  "SELESAI",
  "DIBATALKAN",
];

export default function BookingDetailDrawer({
  booking,
  onClose,
  onUpdated,
}: BookingDetailDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!booking) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [Boolean(booking)]);

  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(
    booking?.status || "BOOKING_BARU"
  );
  const [comment, setComment] = useState("");
  const [notes, setNotes] = useState(booking?.notes || "");
  const [updating, setUpdating] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const { data: session } = useSession();
  const profileName = session?.user?.name ?? "Admin";

  // Sync status & notes saat booking berubah (setelah update)
  useEffect(() => {
    if (booking) {
      setSelectedStatus(booking.status);
      setNotes(booking.notes || "");
    }
  }, [booking?.status, booking?.notes, booking?.id]);

  if (!booking || !mounted) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await updateBookingStatus(booking.id, selectedStatus, comment, profileName);
      showToast("Status booking berhasil diperbarui!");
      setComment("");
      onUpdated?.();
    } catch (e) {
      console.error(e);
      showToast("Gagal memperbarui status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateBookingNotes(booking.id, notes);
      showToast("Catatan admin disimpan!");
      onUpdated?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const startDt = new Date(booking.rentalStartDate);
  const endDt = new Date(booking.rentalEndDate);
  const diffDays = Math.ceil(
    (endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(11,15,25,0.50)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fade-in 0.15s ease-out",
      }}
      onClick={onClose}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%) translateZ(0)",
            background: "var(--card)",
            color: "var(--text)",
            border: "1px solid var(--primary-light)",
            boxShadow: "var(--shadow-lg)",
            borderRadius: 16,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "scale-in 0.2s ease-out",
          }}
        >
          <CheckCircle2 size={16} color="var(--primary)" />
          {toastMsg}
        </div>
      )}

      {/* Drawer Container */}
      <div
        className="drawer-container animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 820,
          height: "100%",
          background: "var(--card)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-soft)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--text)" }}>
                Detail Booking
              </h2>
              <StatusBadge status={booking.status} />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
              ID: {booking.id} • Dibuat:{" "}
              {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Two Column Content */}
        <div
          className="drawer-grid"
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: 28,
            overflowY: "auto",
          }}
        >
          {/* ── LEFT COLUMN: Information ───────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Customer Info Card */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Informasi Customer
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                {booking.customer?.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                <AtSign size={13} style={{ color: "var(--accent-dark)" }} />
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>{booking.customer?.instagram}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)" }}>
                <Phone size={13} />
                <span>{booking.customer?.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--text-muted)" }}>
                <MapPin size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{booking.customer?.address}</span>
              </div>
            </div>

            {/* KTP / KIA Photo Card */}
            {booking.ktpUrl ? (
              <div
                style={{
                  padding: 18,
                  borderRadius: 20,
                  background: "var(--bg-soft)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Foto KTP / KIA Jaminan
                </div>
                <a href={booking.ktpUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative" }}>
                  <img
                    src={booking.ktpUrl}
                    alt="KTP Customer"
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      objectFit: "cover",
                      maxHeight: 160,
                      cursor: "pointer",
                    }}
                  />
                  <div style={{
                    position: "absolute", bottom: 8, right: 8,
                    background: "rgba(0,0,0,0.55)", color: "white",
                    borderRadius: 8, padding: "3px 8px", fontSize: 10.5, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <ExternalLink size={10} />
                    Lihat Penuh
                  </div>
                </a>
              </div>
            ) : (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 20,
                  background: "rgba(239,68,68,0.04)",
                  border: "1px dashed rgba(239,68,68,0.25)",
                  fontSize: 12,
                  color: "#EF4444",
                  fontWeight: 600,
                }}
              >
                ⚠️ Foto KTP / KIA belum diunggah oleh customer.
              </div>
            )}

            {/* Costume Info Card */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Kostum Diberikan
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Shirt size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{booking.costume?.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Stok tersedia: {booking.costume?.available} unit</div>
                </div>
              </div>
            </div>

            {/* Rental Schedule & Event */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Jadwal & Event
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                <Calendar size={14} style={{ color: "var(--primary)" }} />
                <span>
                  {startDt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - {" "}
                  {endDt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99, background: "rgba(139,92,246,0.12)", color: "var(--primary)" }}>
                  {diffDays} hari
                </span>
              </div>
              {booking.eventName && (
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  Event: <strong>{booking.eventName}</strong>
                </div>
              )}
            </div>

            {/* Payment & Pickup */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pembayaran & Pengambilan
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                  <CreditCard size={13} /> {booking.paymentMethod}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                  Rp{booking.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Truck size={13} /> {booking.pickupMethod}
              </div>

              {booking.attachmentUrl && (
                <a
                  href={booking.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--primary)",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={13} /> Lampiran Google Form
                </a>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Status Actions & Timeline ─────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status Selector Card */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Update Status Booking
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as BookingStatus)}
                style={{
                  height: 38,
                  borderRadius: 12,
                  border: "1.5px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: 13,
                  padding: "0 12px",
                  outline: "none",
                }}
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Catatan update (opsional)…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  height: 36,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: 12.5,
                  padding: "0 12px",
                  outline: "none",
                }}
              />

              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn-primary"
                style={{ height: 38, fontSize: 13 }}
              >
                {updating ? "Memproses…" : "Simpan Status Baru"}
              </button>
            </div>

            {/* Notes Editor */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={13} /> Catatan Internal Admin
                </div>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--primary)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Save size={12} /> {savingNotes ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambah catatan khusus untuk booking ini…"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text)",
                  padding: 10,
                  fontSize: 12.5,
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>

            {/* Vertical Timeline */}
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                flex: 1,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                Riwayat Timeline Status
              </div>
              <Timeline entries={booking.timeline || []} currentStatus={booking.status} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
