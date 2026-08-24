import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/customer?instagram=@username
 * Returns saved customer data for auto-fill in the public booking form.
 * No authentication required — only returns non-sensitive profile info.
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
      select: { name: true, phone: true, address: true, instagram: true },
    });

    if (!customer) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    return NextResponse.json({ found: true, customer }, { status: 200 });
  } catch (err) {
    console.error("[PUBLIC CUSTOMER LOOKUP]", err);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
