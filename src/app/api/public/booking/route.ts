import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToAllAdmins } from "@/app/actions/sendPushNotification";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      instagram,
      phone,
      address,
      costumeId,
      rentalStartDate,
      rentalEndDate,
      eventName,
      paymentMethod,
      pickupMethod,
      notes,
      totalAmount,
      paymentType,
      ktpUrl,
    } = body;

    // Validate required fields
    if (!name || !instagram || !phone || !address || !costumeId || !rentalStartDate || !rentalEndDate || !paymentMethod || !pickupMethod) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    // Check costume availability
    const costume = await prisma.costume.findUnique({ where: { id: costumeId } });
    if (!costume) {
      return NextResponse.json({ error: "Kostum tidak ditemukan." }, { status: 404 });
    }
    if (costume.available <= 0) {
      return NextResponse.json({ error: "Kostum tidak tersedia saat ini." }, { status: 409 });
    }

    // Upsert customer by instagram (unique identifier)
    const cleanIg = instagram.startsWith("@") ? instagram : `@${instagram}`;
    const customer = await prisma.customer.upsert({
      where: { instagram: cleanIg },
      update: { name, phone, address },
      create: { name, instagram: cleanIg, phone, address },
    });

    const paymentLabel = paymentType === "DP" ? "DP 50%" : "Full";
    const finalPaymentMethod = paymentType ? `${paymentMethod} (${paymentLabel})` : paymentMethod;
    const finalNotes = notes ? `${notes}\n[Pembayaran: ${paymentLabel}]` : `[Pembayaran: ${paymentLabel}]`;

    // Create booking
    // ℹ️ Stok (available) TIDAK dikurangi di sini.
    // Admin yang mengkonfirmasi booking (MENUNGGU_PEMBAYARAN) yang akan mengurangi stok.
    // Ini memungkinkan beberapa customer booking bersamaan tanpa saling memblokir.
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          customerId: customer.id,
          costumeId,
          rentalStartDate: new Date(rentalStartDate),
          rentalEndDate: new Date(rentalEndDate),
          eventName: eventName || null,
          paymentMethod: finalPaymentMethod,
          pickupMethod,
          notes: finalNotes,
          ktpUrl: ktpUrl || null,
          totalAmount: totalAmount ?? 0,
          status: "BOOKING_BARU",
        },
      });

      // Initial timeline entry
      await tx.timeline.create({
        data: {
          bookingId: b.id,
          status: "BOOKING_BARU",
          updatedBy: "Customer",
          comment: `Booking dikirim (${paymentLabel}). Total: Rp ${(totalAmount ?? 0).toLocaleString("id-ID")}`,
        },
      });

      return b;
    });

    // 🔔 Push notification — fire & forget
    sendPushToAllAdmins({
      type:  "new_booking",
      title: "📋 Booking Baru Masuk!",
      body:  `${customer.name} memesan ${costume.name}`,
      href:  "/notifications",
    }).catch(() => {/* non-fatal */});

    return NextResponse.json({ success: true, bookingId: booking.id }, { status: 201 });
  } catch (err: any) {
    console.error("[PUBLIC BOOKING]", err);
    return NextResponse.json({ error: "Terjadi kesalahan, coba lagi." }, { status: 500 });
  }
}
