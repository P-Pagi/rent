import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/bookings?instagram=@username
 * Fetches booking history for a specific customer based on their Instagram handle.
 * Returns booking details, timeline, and costume information.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("instagram")?.trim();
    if (!raw) {
      return NextResponse.json({ error: "instagram wajib diisi." }, { status: 400 });
    }

    const instagram = raw.startsWith("@") ? raw : `@${raw}`;

    const customer = await prisma.customer.findUnique({
      where: { instagram },
    });

    if (!customer) {
      return NextResponse.json({ found: false, bookings: [] }, { status: 200 });
    }

    const bookings = await prisma.booking.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        costume: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "asc" },
          select: {
            status: true,
            comment: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ found: true, bookings }, { status: 200 });
  } catch (err) {
    console.error("[PUBLIC BOOKINGS HISTORY]", err);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
