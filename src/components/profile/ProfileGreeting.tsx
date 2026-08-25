"use client";

import Link from "next/link";
import { useProfile } from "@/components/profile/ProfileProvider";
import PageHeader from "@/components/shared/PageHeader";

export default function ProfileGreeting() {
  const { profile } = useProfile();
  const accountName = profile.name || "Hana-chan";

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
