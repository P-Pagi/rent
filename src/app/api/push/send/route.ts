import { NextRequest, NextResponse } from "next/server";
import { sendPushToAllAdmins, PushPayload, NotifType } from "@/app/actions/sendPushNotification";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/send
 * Internal endpoint — for testing or triggering from external cron.
 *
 * Body: { type, title, body, href? }
 *
 * Protected by a simple shared secret (PUSH_INTERNAL_SECRET env var).
 * Only callable from server-side / trusted clients.
 */
export async function POST(req: NextRequest) {
  try {
    // Simple bearer auth for internal calls
    const secret = process.env.PUSH_INTERNAL_SECRET;
    if (secret) {
      const auth = req.headers.get("authorization") ?? "";
      if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = (await req.json()) as Partial<PushPayload>;

    if (!body.type || !body.title || !body.body) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, body" },
        { status: 400 }
      );
    }

    const validTypes: NotifType[] = [
      "new_booking",
      "pickup_today",
      "overdue",
      "low_stock",
    ];
    if (!validTypes.includes(body.type as NotifType)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    await sendPushToAllAdmins({
      type:  body.type as NotifType,
      title: body.title,
      body:  body.body,
      href:  body.href,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/push/send error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
