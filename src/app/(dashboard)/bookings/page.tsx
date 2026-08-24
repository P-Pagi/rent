import PageHeader from "@/components/shared/PageHeader";
import BookingTable from "@/components/bookings/BookingTable";
import { getBookings } from "@/app/actions/booking";
import { Booking } from "@/types";

export const revalidate = 0;

export default async function BookingsPage() {
  const result = await getBookings({ limit: 100 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Daftar Booking Kostum"
        subtitle="Kelola pesanan penyewaan, verifikasi pembayaran, dan update status pengiriman/pengembalian."
        emoji="📅"
      />

      <BookingTable initialBookings={result.bookings as unknown as Booking[]} />
    </div>
  );
}
