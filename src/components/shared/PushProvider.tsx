"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Mounts the push notification hook at the app root.
 * Must be a client component — rendered inside SessionProvider context.
 */
export function PushProvider({ children }: { children: React.ReactNode }) {
  usePushNotifications();
  return <>{children}</>;
}
