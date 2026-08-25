import ProfileGreeting from "../../../components/profile/ProfileGreeting";
import DashboardCard from "@/components/shared/DashboardCard";
import ChartCard from "@/components/shared/ChartCard";
import StatusBadge from "@/components/shared/StatusBadge";
import BookingChart from "@/components/dashboard/BookingChart";
import { PaymentChart, PickupChart } from "@/components/dashboard/DistributionCharts";
import {
  getDashboardStats,
  getMonthlyBookings,
  getPaymentMethodStats,
  getPickupMethodStats,
  getRecentBookings,
  getUpcomingBookings,
} from "@/lib/dashboard";
import { BookingStatus } from "@/types";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, User, Shirt } from "lucide-react";

export const revalidate = 0;

export default async function DashboardPage() {
  const [
    stats,
    monthlyData,
    paymentData,
    pickupData,
    recentBookings,
    upcomingBookings,
  ] = await Promise.all([
    getDashboardStats(),
    getMonthlyBookings(),
    getPaymentMethodStats(),
    getPickupMethodStats(),
    getRecentBookings(),
    getUpcomingBookings(),
  ]);

  const cards = [
    {
      title: "Booking Baru",
      value: stats.bookingBaru,
      subtitle: "Menunggu diproses",
      color: "#8B5CF6",
      trend: { value: stats.trendBookingBaru, label: "vs. minggu lalu" },
    },
    {
      title: "Sedang Diproses",
      value: stats.sedangDiproses,
      subtitle: "Konfirmasi & persiapan",
      color: "#F9A8D4",
    },
    {
      title: "Sedang Disewa",
      value: stats.sedangDisewa,
      subtitle: "Kostum dibawa customer",
      color: "#6D28D9",
    },
    {
      title: "Selesai Bulan Ini",
      value: stats.selesaiBulanIni,
      subtitle: "Rental sukses",
      color: "#86EFAC",
      trend: { value: stats.trendSelesaiBulanIni, label: "vs. bulan lalu" },
    },
    {
      title: "Total Customer",
      value: stats.totalCustomer,
      subtitle: "Terdaftar di sistem",
      color: "#FCD34D",
    },
    {
      title: "Booking Hari Ini",
      value: stats.bookingHariIni,
      subtitle: "Form masuk hari ini",
      color: "#2563EB",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ── Page Header ───────────────────────────────────────── */}
      <ProfileGreeting />

      {/* ── KPI Summary Cards ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {cards.map((card, idx) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            color={card.color}
            trend={card.trend}
            style={{ animationDelay: `${idx * 0.08}s` }}
          />
        ))}
      </div>

      {/* ── Main Charts Grid ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {/* Monthly Booking Trend (Spans 2 columns on wide layout) */}
        <div style={{ gridColumn: "span 2" }}>
          <ChartCard
            title="Tren Booking & Selesai"
            subtitle="Perbandingan booking masuk vs rental selesai per bulan"
          >
            <BookingChart data={monthlyData} />
          </ChartCard>
        </div>

        {/* Payment & Pickup Method Distributions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ChartCard title="Metode Pembayaran" subtitle="Distribusi transaksi customer" minHeight={200}>
            <PaymentChart data={paymentData} />
          </ChartCard>
        </div>
      </div>

      {/* ── Distribution Bar & Recent Activity Grid ──────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <ChartCard title="Metode Pengambilan" subtitle="Pilihan penyerahan kostum" minHeight={200}>
          <PickupChart data={pickupData} />
        </ChartCard>

        {/* ── Quick Calendar / Upcoming Schedule ────────────── */}
        <div className="kawaii-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Jadwal Mendatang</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Pengambilan & Pengembalian 30 hari ke depan
              </p>
            </div>
            <Link href="/calendar" style={{ color: "var(--primary)", fontSize: 12.5, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Kalender <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 220 }}>
            {upcomingBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 12.5 }}>
                Tidak ada jadwal dalam 30 hari ke depan.
              </div>
            ) : (
              upcomingBookings.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: "rgba(139,92,246,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)",
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.costume?.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>
                      {item.customer?.name} • {new Date(item.rentalStartDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <StatusBadge status={item.status as BookingStatus} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Bookings Table ─────────────────────────────── */}
      <div className="kawaii-card" style={{ padding: 24, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Booking Terbaru</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Transaksi rental yang baru masuk dari Google Forms
            </p>
          </div>
          <Link
            href="/bookings"
            style={{
              color: "var(--primary)",
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Lihat Semua <ArrowRight size={13} />
          </Link>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>TANGGAL</th>
                <th style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>CUSTOMER</th>
                <th style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>KOSTUM</th>
                <th style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>EVENT</th>
                <th style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>TOTAL</th>
                <th style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    transition: "background-color 0.2s",
                  }}
                >
                  <td style={{ padding: "14px", fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                    {new Date(b.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{b.customer?.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 600 }}>{b.customer?.instagram}</div>
                  </td>
                  <td style={{ padding: "14px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                    {b.costume?.name}
                  </td>
                  <td style={{ padding: "14px", fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
                    {b.eventName || "-"}
                  </td>
                  <td style={{ padding: "14px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                    Rp{b.totalAmount.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <StatusBadge status={b.status as BookingStatus} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
