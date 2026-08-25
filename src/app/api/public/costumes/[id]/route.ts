import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const costume = await prisma.costume.findUnique({ where: { id } });
    if (!costume) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(costume);
  } catch (err) {
    console.error("[PUBLIC COSTUME GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
