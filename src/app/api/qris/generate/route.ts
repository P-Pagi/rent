import { NextResponse } from "next/server";
import { getStaticQrisFromPublic, generateDynamicQris } from "@/lib/qris";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = getStaticQrisFromPublic();
    return NextResponse.json({
      success: true,
      source: info.source,
      staticString: info.staticString,
      hasQrisImage: info.source.startsWith("public/"),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, bookingId, staticString } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Nominal pembayaran (amount) harus angka positif." },
        { status: 400 }
      );
    }

    const result = await generateDynamicQris(
      Number(amount),
      bookingId,
      staticString
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[API QRIS GENERATE ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Gagal membuat Dynamic QRIS." },
      { status: 500 }
    );
  }
}
