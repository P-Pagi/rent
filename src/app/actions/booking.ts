"use server";

import { prisma } from "@/lib/db";
import { BookingStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { sendPushToAllAdmins } from "@/app/actions/sendPushNotification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getBookings(query?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query?.status) {
    where.status = query.status;
  }

  if (query?.search) {
    const s = query.search.toLowerCase();
    where.OR = [
      { customer: { name: { contains: s } } },
      { customer: { instagram: { contains: s } } },
      { customer: { phone: { contains: s } } },
      { costume: { name: { contains: s } } },
      { eventName: { contains: s } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { bookingDate: "desc" },
      include: {
        customer: true,
        costume: true,
        timeline: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      costume: true,
      timeline: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function updateBookingStatus(
  id: string,
  newStatus: BookingStatus,
  comment?: string,
  updatedByParam?: string
) {
  const session = await getServerSession(authOptions);
  const updatedBy = session?.user?.name || updatedByParam || "Admin (System)";

  const updated = await prisma.$transaction(async (tx) => {
    // Check previous status before update
    const currentBooking = await tx.booking.findUnique({
      where: { id },
      select: { status: true },
    });
    const prevStatus = currentBooking?.status;

    // 1. Update status on booking
    const booking = await tx.booking.update({
      where: { id },
      data: { status: newStatus },
      include: { customer: true, costume: true },
    });

    // 2. Add entry to timeline
    await tx.timeline.create({
      data: {
        bookingId: id,
        status: newStatus,
        updatedBy,
        comment: comment || ({
          BOOKING_BARU:        "Booking baru masuk",
          SUDAH_DIBAYAR:       "Pembayaran telah dikonfirmasi",
          KOSTUM_DISIAPKAN:    "Kostum sedang disiapkan",
          SUDAH_DIAMBIL:       "Kostum sudah diambil oleh customer",
          SEDANG_DISEWA:       "Kostum sedang dalam masa sewa",
          SUDAH_DIKEMBALIKAN:  "Kostum sudah dikembalikan",
          SELESAI:             "Transaksi selesai",
          DIBATALKAN:          "Booking dibatalkan",
        } as Record<string, string>)[newStatus] || `Status diubah menjadi ${newStatus.replace(/_/g, " ")}`,
      },
    });

    // 3. Update customer total rentals if completed
    if (newStatus === "SELESAI") {
      await tx.customer.update({
        where: { id: booking.customerId },
        data: { totalRentals: { increment: 1 } },
      });
    }

    // 4. Update stok kostum berdasarkan perubahan status
    const costumeId = booking.costumeId;
    if (newStatus === "SUDAH_DIBAYAR") {
      // Admin konfirmasi pembayaran → kurangi available (hanya jika baru pertama konfirmasi)
      const isFirstConfirm = !["SUDAH_DIBAYAR", "KOSTUM_DISIAPKAN", "SUDAH_DIAMBIL", "SEDANG_DISEWA", "SUDAH_DIKEMBALIKAN", "SELESAI"].includes(prevStatus || "");
      if (isFirstConfirm) {
        await tx.costume.update({
          where: { id: costumeId },
          data: { available: { decrement: 1 } },
        });
      }
    } else if (newStatus === "SUDAH_DIAMBIL" || newStatus === "SEDANG_DISEWA") {
      // Kostum secara fisik dipakai customer → tambah borrowed HANYA jika sebelumnya belum dalam status peminjaman aktif
      const alreadyBorrowed = prevStatus === "SUDAH_DIAMBIL" || prevStatus === "SEDANG_DISEWA";
      if (!alreadyBorrowed) {
        await tx.costume.update({
          where: { id: costumeId },
          data: { borrowed: { increment: 1 } },
        });
      }
    } else if (newStatus === "SUDAH_DIKEMBALIKAN" || newStatus === "SELESAI") {
      // Transaksi sewa selesai/dikembalikan → kurangi borrowed (-1) jika sedang dipinjam, masuk maintenance/laundry (+1) untuk cuci & QC
      // Stok available TIDAK bertambah di sini (tetap terkunci di maintenance sampai admin klik 'Selesai Cuci' di Manajemen Kostum)
      const alreadyProcessed = ["SUDAH_DIKEMBALIKAN", "SELESAI"].includes(prevStatus || "");
      if (!alreadyProcessed) {
        const currentCostume = await tx.costume.findUnique({ where: { id: costumeId } });
        await tx.costume.update({
          where: { id: costumeId },
          data: {
            ...(currentCostume && currentCostume.borrowed > 0 ? { borrowed: { decrement: 1 } } : {}),
            maintenance: { increment: 1 },
          },
        });
      }
    } else if (newStatus === "DIBATALKAN") {
      // Booking dibatalkan — kembalikan stok berdasarkan status terakhir
      const wasConfirmed = ["SUDAH_DIBAYAR", "KOSTUM_DISIAPKAN", "SUDAH_DIAMBIL", "SEDANG_DISEWA", "SUDAH_DIKEMBALIKAN"].includes(prevStatus || "");
      if (wasConfirmed) {
        const currentCostume = await tx.costume.findUnique({ where: { id: costumeId } });
        const wasBorrowed = ["SUDAH_DIAMBIL", "SEDANG_DISEWA"].includes(prevStatus || "");
        const wasReturned = prevStatus === "SUDAH_DIKEMBALIKAN";

        await tx.costume.update({
          where: { id: costumeId },
          data: {
            available: { increment: 1 },
            ...(wasBorrowed && currentCostume && currentCostume.borrowed > 0
              ? { borrowed: { decrement: 1 } }
              : {}),
            ...(wasReturned && currentCostume && currentCostume.maintenance > 0
              ? { maintenance: { decrement: 1 } }
              : {}),
          },
        });
      }
    }

    return booking;
  }, {
    maxWait: 10000,
    timeout: 20000,
  });

  revalidatePath("/bookings");
  revalidatePath("/dashboard");

  // 🔄 Auto-advance: jika status SUDAH_DIBAYAR → otomatis lanjut ke KOSTUM_DISIAPKAN
  if (newStatus === "SUDAH_DIBAYAR") {
    await updateBookingStatus(
      id,
      "KOSTUM_DISIAPKAN",
      "Kostum sedang disiapkan",
      updatedBy
    );
    return updated;
  }

  // 🔄 Auto-advance: jika status SUDAH_DIAMBIL → otomatis lanjut ke SEDANG_DISEWA
  if (newStatus === "SUDAH_DIAMBIL") {
    await updateBookingStatus(
      id,
      "SEDANG_DISEWA",
      "Kostum sedang dalam masa sewa",
      updatedBy
    );
    return updated;
  }

  // 🔔 Push notifications for important status changes
  if (newStatus === "SUDAH_DIKEMBALIKAN" || newStatus === "SELESAI") {
    // Check if any costumes went low stock after this return
    const updatedCostume = await prisma.costume.findUnique({
      where: { id: updated.costumeId },
    });
    if (updatedCostume && updatedCostume.available <= 1 && updatedCostume.stock >= 2) {
      sendPushToAllAdmins({
        type: "low_stock",
        title: "⚠️ Stok Hampir Habis",
        body: `${updatedCostume.name} — tersisa ${updatedCostume.available} unit`,
        href: "/notifications",
      }).catch(() => { });
    }
  }

  return updated;
}

export async function updateBookingNotes(id: string, notes: string) {
  const updated = await prisma.booking.update({
    where: { id },
    data: { notes },
  });
  revalidatePath("/bookings");
  return updated;
}
