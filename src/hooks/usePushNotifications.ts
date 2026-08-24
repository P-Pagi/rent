"use client";

import { useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useSession } from "next-auth/react";

/**
 * usePushNotifications
 *
 * Registers for FCM push notifications on Android (Capacitor).
 * - Requests permission on first mount
 * - Sends the FCM token to the server for storage
 * - Handles foreground + background notification taps (deep link routing)
 *
 * This hook is a no-op on web — safe to mount in the root layout.
 */
export function usePushNotifications() {
  const { data: session } = useSession();

  const registerToken = useCallback(async (token: string) => {
    try {
      await fetch("/api/push/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token }),
      });
    } catch {
      // ignore network errors — will retry on next app open
    }
  }, []);

  const handleNotificationAction = useCallback((href: string) => {
    if (typeof window !== "undefined" && href) {
      window.location.href = href;
    }
  }, []);

  useEffect(() => {
    // Only run on native Android/iOS via Capacitor
    if (!Capacitor.isNativePlatform()) return;
    // Only proceed when logged in
    if (!session?.user?.email) return;

    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        // Dynamic import so it doesn't break SSR / web builds
        const { PushNotifications } = await import(
          "@capacitor/push-notifications"
        );

        // ── 1. Request permission ──────────────────────────────────────
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== "granted") {
          console.warn("[Push] Permission not granted");
          return;
        }

        // ── 2. Register with FCM ───────────────────────────────────────
        await PushNotifications.register();

        // ── 3. Listen for token ────────────────────────────────────────
        const regListener = await PushNotifications.addListener(
          "registration",
          ({ value: token }) => {
            console.log("[Push] FCM token received:", token.slice(0, 20) + "…");
            registerToken(token);
          }
        );

        // ── 4. Registration error ──────────────────────────────────────
        const errListener = await PushNotifications.addListener(
          "registrationError",
          (err) => {
            console.error("[Push] Registration error:", err.error);
          }
        );

        // ── 5. Foreground notification received ────────────────────────
        const fgListener = await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("[Push] Foreground notification:", notification.title);
            // The in-app bell already handles this — no extra UI needed
          }
        );

        // ── 6. Notification tapped (background / killed state) ─────
        const tapListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            // Always navigate to notification center when any push is tapped
            const href = "/notifications";
            console.log("[Push] Notification tapped → navigating to", href);
            handleNotificationAction(href);
          }
        );

        // ── 7. Create notification channels (Android 8+) ────────────────
        await PushNotifications.createChannel({
          id:          "bookings",
          name:        "📋 Booking",
          description: "Notifikasi booking baru dan pengambilan",
          importance:  4, // IMPORTANCE_HIGH
          sound:       "default",
          vibration:   true,
          lights:      true,
          lightColor:  "#2563EB",
          visibility:  1, // VISIBILITY_PUBLIC
        });

        await PushNotifications.createChannel({
          id:          "alerts",
          name:        "⚠️ Peringatan",
          description: "Pengembalian terlambat dan stok habis",
          importance:  4, // IMPORTANCE_HIGH
          sound:       "default",
          vibration:   true,
          lights:      true,
          lightColor:  "#DC2626",
          visibility:  1,
        });

        cleanup = () => {
          regListener.remove();
          errListener.remove();
          fgListener.remove();
          tapListener.remove();
        };
      } catch (err) {
        console.error("[Push] Setup error:", err);
      }
    })();

    return () => {
      cleanup?.();
    };
  }, [session?.user?.email, registerToken, handleNotificationAction]);
}
