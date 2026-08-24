import { prisma } from "@/lib/db";
import NotificationsClient from "@/components/notifications/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // New bookings
  const newBookings = await prisma.booking.findMany({
    where: { status: "BOOKING_BARU" },
    include: { customer: true, costume: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Pickups today
  const todayPickups = await prisma.booking.findMany({
    where: {
      rentalStartDate: { gte: today, lt: tomorrow },
      status: { notIn: ["DIBATALKAN", "SELESAI", "SUDAH_DIKEMBALIKAN"] },
    },
    include: { customer: true, costume: true },
    orderBy: { rentalStartDate: "asc" },
    take: 20,
  });

  // Overdue
  const overdue = await prisma.booking.findMany({
    where: {
      rentalEndDate: { lt: today },
      status: { in: ["SUDAH_DIAMBIL", "SEDANG_DISEWA"] },
    },
    include: { customer: true, costume: true },
    orderBy: { rentalEndDate: "asc" },
    take: 20,
  });

  // Low stock
  const lowStock = await prisma.costume.findMany({
    where: { available: { lte: 1 }, stock: { gte: 2 } },
    orderBy: { available: "asc" },
  });

  const notifications = [
    ...newBookings.map((b) => ({
      id: `new-${b.id}`,
      type: "new_booking" as const,
      title: "Booking Baru Masuk",
      body: `${b.customer.name} memesan ${b.costume.name}`,
      detail: `Metode: ${b.pickupMethod} · Bayar: ${b.paymentMethod}`,
      time: b.createdAt.toISOString(),
      href: "/bookings",
      bookingId: b.id,
      customerName: b.customer.name,
      costumeName: b.costume.name,
    })),
    ...todayPickups.map((b) => ({
      id: `pickup-${b.id}`,
      type: "pickup_today" as const,
      title: "Pengambilan Hari Ini",
      body: `${b.customer.name} – ${b.costume.name}`,
      detail: `Metode: ${b.pickupMethod} · Status: ${b.status.replaceAll("_", " ")}`,
      time: b.rentalStartDate.toISOString(),
      href: "/bookings",
      bookingId: b.id,
      customerName: b.customer.name,
      costumeName: b.costume.name,
    })),
    ...overdue.map((b) => ({
      id: `overdue-${b.id}`,
      type: "overdue" as const,
      title: "Pengembalian Terlambat",
      body: `${b.customer.name} – ${b.costume.name}`,
      detail: `Jatuh tempo: ${new Date(b.rentalEndDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`,
      time: b.rentalEndDate.toISOString(),
      href: "/bookings",
      bookingId: b.id,
      customerName: b.customer.name,
      costumeName: b.costume.name,
    })),
    ...lowStock.map((c) => ({
      id: `stock-${c.id}`,
      type: "low_stock" as const,
      title: "Stok Hampir Habis",
      body: `${c.name}`,
      detail: `Tersedia: ${c.available} dari ${c.stock} unit`,
      time: c.updatedAt.toISOString(),
      href: "/costumes",
      bookingId: null,
      customerName: null,
      costumeName: c.name,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return <NotificationsClient notifications={notifications} />;
}
