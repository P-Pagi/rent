import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAllAdmins } from "@/app/actions/sendPushNotification";

export const dynamic = "force-dynamic";

/**
 * GET /api/push/check-overdue
 *
 * Checks for overdue rentals and today's pickups, then fires push notifications.
 * Intended to be called by a cron job (e.g. every hour via cron-job.org or Vercel Cron).
 *
 * Protect with PUSH_INTERNAL_SECRET if exposed publicly.
 */
export async function GET(req: NextRequest) {
  // Optional bearer auth
  const secret = process.env.PUSH_INTERNAL_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const sent: string[] = [];

  // ── 1. Overdue rentals ──────────────────────────────────────────────────
  const overdueBookings = await prisma.booking.findMany({
    where: {
      rentalEndDate: { lt: todayStart },
      status: { in: ["SUDAH_DIAMBIL", "SEDANG_DISEWA"] },
    },
    include: { customer: true, costume: true },
    take: 5,
  });

  if (overdueBookings.length > 0) {
    const names = overdueBookings
      .slice(0, 3)
      .map((b) => b.customer.name)
      .join(", ");
    const more = overdueBookings.length > 3 ? ` +${overdueBookings.length - 3} lainnya` : "";

    await sendPushToAllAdmins({
      type: "overdue",
      title: `⚠️ ${overdueBookings.length} Pengembalian Terlambat!`,
      body: `${names}${more} belum mengembalikan kostum`,
      href: "/notifications",
    });
    sent.push(`overdue: ${overdueBookings.length}`);
  }

  // ── 2. Pickups happening today ──────────────────────────────────────────
  const todayPickups = await prisma.booking.findMany({
    where: {
      rentalStartDate: { gte: todayStart, lt: todayEnd },
      status: { notIn: ["DIBATALKAN", "SELESAI", "SUDAH_DIKEMBALIKAN"] },
    },
    include: { customer: true, costume: true },
    take: 5,
  });

  if (todayPickups.length > 0) {
    const names = todayPickups
      .slice(0, 3)
      .map((b) => `${b.customer.name} (${b.costume.name})`)
      .join(", ");
    const more = todayPickups.length > 3 ? ` +${todayPickups.length - 3} lainnya` : "";

    await sendPushToAllAdmins({
      type: "pickup_today",
      title: `${todayPickups.length} Pengambilan Hari Ini`,
      body: `${names}${more}`,
      href: "/notifications",
    });
    sent.push(`pickup_today: ${todayPickups.length}`);
  }

  return NextResponse.json({
    ok: true,
    checked_at: now.toISOString(),
    sent,
  });
}
