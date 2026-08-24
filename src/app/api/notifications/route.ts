import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Helper: find-or-create admin row by email */
async function getAdmin(email: string) {
  let admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    admin = await prisma.admin.create({
      data: { email, username: email.split("@")[0], password: "" },
    });
  }
  return admin;
}

export async function GET() {
  const notifications: {
    id: string;
    type: "new_booking" | "pickup_today" | "overdue" | "low_stock";
    title: string;
    body: string;
    time: Date;
    href: string;
  }[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. New unconfirmed bookings (BOOKING_BARU)
  const newBookings = await prisma.booking.findMany({
    where: { status: "BOOKING_BARU" },
    include: { customer: true, costume: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  for (const b of newBookings) {
    notifications.push({
      id: `new-${b.id}`,
      type: "new_booking",
      title: "Booking Baru Masuk",
      body: `${b.customer.name} → ${b.costume.name}`,
      time: b.createdAt,
      href: "/bookings",
    });
  }

  // 2. Pickups happening today (rentalStartDate = today)
  const todayPickups = await prisma.booking.findMany({
    where: {
      rentalStartDate: { gte: today, lt: tomorrow },
      status: { notIn: ["DIBATALKAN", "SELESAI", "SUDAH_DIKEMBALIKAN"] },
    },
    include: { customer: true, costume: true },
    take: 5,
  });
  for (const b of todayPickups) {
    notifications.push({
      id: `pickup-${b.id}`,
      type: "pickup_today",
      title: "Pengambilan Hari Ini",
      body: `${b.customer.name} – ${b.costume.name}`,
      time: b.rentalStartDate,
      href: "/bookings",
    });
  }

  // 3. Overdue rentals (rentalEndDate has passed, still active)
  const overdue = await prisma.booking.findMany({
    where: {
      rentalEndDate: { lt: today },
      status: { in: ["SUDAH_DIAMBIL", "SEDANG_DISEWA"] },
    },
    include: { customer: true, costume: true },
    take: 5,
  });
  for (const b of overdue) {
    notifications.push({
      id: `overdue-${b.id}`,
      type: "overdue",
      title: "Pengembalian Terlambat",
      body: `${b.customer.name} – ${b.costume.name}`,
      time: b.rentalEndDate,
      href: "/bookings",
    });
  }

  // 4. Low stock costumes (available <= 1, stock >= 2)
  const lowStock = await prisma.costume.findMany({
    where: { available: { lte: 1 }, stock: { gte: 2 } },
    take: 3,
  });
  for (const c of lowStock) {
    notifications.push({
      id: `stock-${c.id}`,
      type: "low_stock",
      title: "Stok Hampir Habis",
      body: `${c.name} – tersisa ${c.available} unit`,
      time: c.updatedAt,
      href: "/costumes",
    });
  }

  // Sort by most recent first
  notifications.sort((a, b) => b.time.getTime() - a.time.getTime());
  const result = notifications.slice(0, 12);

  // Load read IDs from DB for the current session user
  let readIds: string[] = [];
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (email) {
      const admin = await getAdmin(email);
      readIds = admin.readNotifIds
        ? admin.readNotifIds.split(",").filter(Boolean)
        : [];
    }
  } catch {
    // ignore — fall back to empty read list
  }

  return NextResponse.json({ notifications: result, readIds });
}

/** PATCH /api/notifications — save read notification IDs for the logged-in admin */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const ids: string[] = Array.isArray(body.readIds) ? body.readIds : [];

    const admin = await getAdmin(email);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { readNotifIds: ids.join(",") },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/notifications error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
