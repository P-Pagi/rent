import { prisma } from "@/lib/db";
import { DashboardStats } from "@/types";

// ─── Helper: get start of today ───────────────────────────────────────────
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ─── Helper: get start of this month ──────────────────────────────────────
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now   = new Date();
  const today = startOfDay(now);
  const month = startOfMonth(now);
  
  // start of this week (Monday)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), diff);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // start of last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const IN_PROGRESS = [
    "MENUNGGU_KONFIRMASI",
    "MENUNGGU_PEMBAYARAN",
    "SUDAH_DIBAYAR",
    "KOSTUM_DISIAPKAN",
    "SUDAH_DIAMBIL",
  ];

  const [
    bookingBaru,
    sedangDiproses,
    sedangDisewa,
    selesaiBulanIni,
    totalCustomer,
    bookingHariIni,
    bookingsThisWeek,
    bookingsLastWeek,
    selesaiBulanLalu,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "BOOKING_BARU" } }),
    prisma.booking.count({ where: { status: { in: IN_PROGRESS } } }),
    prisma.booking.count({ where: { status: "SEDANG_DISEWA" } }),
    prisma.booking.count({
      where: { status: "SELESAI", updatedAt: { gte: month } },
    }),
    prisma.customer.count(),
    prisma.booking.count({ where: { bookingDate: { gte: today } } }),
    prisma.booking.count({ where: { bookingDate: { gte: thisWeekStart } } }),
    prisma.booking.count({ where: { bookingDate: { gte: lastWeekStart, lt: thisWeekStart } } }),
    prisma.booking.count({
      where: { status: "SELESAI", updatedAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
  ]);

  let trendBookingBaru = 0;
  if (bookingsLastWeek > 0) {
    trendBookingBaru = Math.round(((bookingsThisWeek - bookingsLastWeek) / bookingsLastWeek) * 100);
  } else if (bookingsThisWeek > 0) {
    trendBookingBaru = 100;
  }

  let trendSelesaiBulanIni = 0;
  if (selesaiBulanLalu > 0) {
    trendSelesaiBulanIni = Math.round(((selesaiBulanIni - selesaiBulanLalu) / selesaiBulanLalu) * 100);
  } else if (selesaiBulanIni > 0) {
    trendSelesaiBulanIni = 100;
  }

  return {
    bookingBaru,
    sedangDiproses,
    sedangDisewa,
    selesaiBulanIni,
    totalCustomer,
    bookingHariIni,
    trendBookingBaru,
    trendSelesaiBulanIni,
  };
}

// ─── Monthly booking count for last 6 months ─────────────────────────────
export async function getMonthlyBookings() {
  const now    = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      year:  d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      start: d,
      end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  });

  const data = await Promise.all(
    months.map(async (m) => ({
      name:   m.label,
      total:  await prisma.booking.count({
        where: { bookingDate: { gte: m.start, lte: m.end } },
      }),
      selesai: await prisma.booking.count({
        where: {
          status: "SELESAI",
          bookingDate: { gte: m.start, lte: m.end },
        },
      }),
    }))
  );
  return data;
}

// ─── Payment method distribution ─────────────────────────────────────────
export async function getPaymentMethodStats() {
  const bookings = await prisma.booking.findMany({
    select: { paymentMethod: true },
  });
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    counts[b.paymentMethod] = (counts[b.paymentMethod] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// ─── Pickup method distribution ───────────────────────────────────────────
export async function getPickupMethodStats() {
  const bookings = await prisma.booking.findMany({
    select: { pickupMethod: true },
  });
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    counts[b.pickupMethod] = (counts[b.pickupMethod] ?? 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// ─── Recent bookings (latest 8) ───────────────────────────────────────────
export async function getRecentBookings() {
  return prisma.booking.findMany({
    take: 8,
    orderBy: { bookingDate: "desc" },
    include: {
      customer: { select: { name: true, instagram: true } },
      costume:  { select: { name: true } },
    },
  });
}

// ─── Upcoming calendar events (next 30 days) ──────────────────────────────
export async function getUpcomingBookings() {
  const now    = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return prisma.booking.findMany({
    where: {
      OR: [
        { rentalStartDate: { gte: now, lte: future } },
        { rentalEndDate:   { gte: now, lte: future } },
      ],
    },
    include: {
      customer: { select: { name: true } },
      costume:  { select: { name: true } },
    },
    orderBy: { rentalStartDate: "asc" },
  });
}
