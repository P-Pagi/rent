import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/register
 * Body: { token: string }
 *
 * Saves the FCM device token for the currently logged-in admin.
 * Called by the Capacitor app after receiving a registration token.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const token: string = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid token" },
        { status: 400 }
      );
    }

    // Upsert admin row (create if not exists, then update token)
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      await prisma.admin.update({
        where: { email },
        data:  { fcmToken: token },
      });
    } else {
      await prisma.admin.create({
        data: {
          email,
          username: email.split("@")[0],
          password: "",
          fcmToken: token,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/push/register error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/push/register
 * Clears the FCM token on logout so the device stops receiving notifications.
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ ok: true });

    await prisma.admin.updateMany({
      where: { email },
      data:  { fcmToken: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/push/register error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
