import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { ProfileProvider } from "@/components/profile/ProfileProvider";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "noyrent.cos | Cosplay Admin Dashboard",
  description:
    "Admin dashboard for managing cosplay costume rentals — bookings, costumes, customers, and schedules.",
  keywords: ["cosplay", "rental", "admin", "noyrent", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={quicksand.variable} suppressHydrationWarning>
      <body className="min-h-full antialiased" style={{ fontFamily: "var(--font-quicksand), Quicksand, system-ui, sans-serif" }}>
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
