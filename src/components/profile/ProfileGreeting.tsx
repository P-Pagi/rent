"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/shared/PageHeader";

export default function ProfileGreeting() {
  const { data: session } = useSession();
  const accountName = session?.user?.name ?? "Hana-chan";

  return (
    <PageHeader
      title={`Selamat datang kembali, ${accountName}!`}
      subtitle="Berikut ringkasan performa penyewaan kostum cosplay hari ini."
      action={
        <Link href="/bookings" className="btn-primary" style={{ textDecoration: "none" }}>
          Kelola Booking
        </Link>
      }
    />
  );
}
