"use server";

import { getMessaging } from "@/lib/firebase-admin";
import { prisma } from "@/lib/db";

export type NotifType =
  | "new_booking"
  | "pickup_today"
  | "overdue"
  | "low_stock";

export interface PushPayload {
  type: NotifType;
  title: string;
  body: string;
  /** Deep-link path inside the app, e.g. "/bookings" */
  href?: string;
}

const TYPE_CHANNEL: Record<NotifType, string> = {
  new_booking:  "bookings",
  pickup_today: "bookings",
  overdue:      "alerts",
  low_stock:    "alerts",
};

const TYPE_COLOR: Record<NotifType, string> = {
  new_booking:  "#2563EB",
  pickup_today: "#0284C7",
  overdue:      "#DC2626",
  low_stock:    "#B45309",
};

/**
 * Sends a push notification to ALL admins that have registered an FCM token.
 * Silently skips admins without a token.
 */
export async function sendPushToAllAdmins(payload: PushPayload): Promise<void> {
  // Pull all FCM tokens
  const admins = await prisma.admin.findMany({
    select: { fcmToken: true },
    where: { fcmToken: { not: null } },
  });

  const tokens = admins
    .map((a) => a.fcmToken!)
    .filter(Boolean);

  if (tokens.length === 0) return;

  const messaging = getMessaging();

  // Send to each token individually so one invalid token doesn't block others
  const results = await Promise.allSettled(
    tokens.map((token) =>
      messaging.send({
        token,
        notification: {
          title: payload.title,
          body:  payload.body,
        },
        data: {
          type: payload.type,
          href: payload.href ?? "/",
        },
        android: {
          priority: payload.type === "overdue" ? "high" : "normal",
          notification: {
            channelId: TYPE_CHANNEL[payload.type],
            color:     TYPE_COLOR[payload.type],
            // Small icon must exist in Android res — ic_stat_notification
            icon: "ic_stat_notification",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
            sound: "default",
            vibrateTimingsMillis:
              payload.type === "overdue"
                ? [0, 250, 100, 250]
                : [0, 150],
          },
        },
      })
    )
  );

  // Remove stale / invalid tokens from DB
  const staleTokens: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as { code?: string };
      if (
        err.code === "messaging/registration-token-not-registered" ||
        err.code === "messaging/invalid-registration-token"
      ) {
        staleTokens.push(tokens[i]);
      }
    }
  });

  if (staleTokens.length > 0) {
    await prisma.admin.updateMany({
      where: { fcmToken: { in: staleTokens } },
      data:  { fcmToken: null },
    });
  }
}
