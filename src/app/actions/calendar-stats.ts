"use server";

import { prisma } from "@/lib/db";

export async function getCalendarEvents() {
  const bookings = await prisma.booking.findMany({
    include: {
      customer: { select: { name: true, instagram: true } },
      costume:  { select: { name: true } },
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });

  const events = bookings.map((b) => {
    let color = "#8B5CF6";
    if (b.status === "SELESAI") color = "#86EFAC";
    if (b.status === "SEDANG_DISEWA") color = "#6D28D9";
    if (b.status === "DIBATALKAN") color = "#FCA5A5";
    if (b.status === "BOOKING_BARU") color = "#BEE3F8";

    return {
      id: b.id,
      title: `${b.costume?.name} (${b.customer?.name})`,
      start: b.rentalStartDate,
      end: b.rentalEndDate,
      backgroundColor: color,
      borderColor: color,
      textColor: b.status === "SELESAI" || b.status === "BOOKING_BARU" ? "#1E1B2E" : "#FFFFFF",
      extendedProps: {
        booking: b,
      },
    };
  });

  return events;
}

export async function getStatisticsData() {
  const [
    totalBookings,
    totalRevenueResult,
    topCostumes,
    customers,
    bookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "DIBATALKAN" } },
    }),
    prisma.costume.findMany({
      orderBy: { popularity: "desc" },
      take: 5,
    }),
    prisma.customer.findMany({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.booking.findMany({
      select: {
        bookingDate: true,
        paymentMethod: true,
        pickupMethod: true,
        totalAmount: true,
        status: true,
      },
    }),
  ]);

  // Day of week distribution
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayCounts: Record<string, number> = {};
  dayNames.forEach((d) => (dayCounts[d] = 0));
  bookings.forEach((b) => {
    const day = dayNames[new Date(b.bookingDate).getDay()];
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const dailyDistribution = dayNames.map((d) => ({ day: d, total: dayCounts[d] }));

  // Payment methods
  const payMap: Record<string, number> = {};
  bookings.forEach((b) => {
    payMap[b.paymentMethod] = (payMap[b.paymentMethod] || 0) + 1;
  });
  const paymentMethods = Object.entries(payMap).map(([name, value]) => ({ name, value }));

  // Pickup methods
  const pickupMap: Record<string, number> = {};
  bookings.forEach((b) => {
    pickupMap[b.pickupMethod] = (pickupMap[b.pickupMethod] || 0) + 1;
  });
  const pickupMethods = Object.entries(pickupMap).map(([name, value]) => ({ name, value }));

  // Customer growth timeline
  const customerGrowthMap: Record<string, number> = {};
  customers.forEach((c) => {
    const dateStr = new Date(c.createdAt).toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
    customerGrowthMap[dateStr] = (customerGrowthMap[dateStr] || 0) + 1;
  });
  let cumulative = 0;
  const customerGrowth = Object.entries(customerGrowthMap).map(([date, count]) => {
    cumulative += count;
    return { date, total: cumulative };
  });

  return {
    totalBookings,
    totalRevenue: totalRevenueResult._sum.totalAmount || 0,
    topCostumes: topCostumes.map((c) => ({ name: c.name, popularity: c.popularity, stock: c.stock })),
    dailyDistribution,
    paymentMethods,
    pickupMethods,
    customerGrowth,
  };
}
