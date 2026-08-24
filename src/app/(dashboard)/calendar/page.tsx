import PageHeader from "@/components/shared/PageHeader";
import CalendarClient from "@/components/calendar/CalendarClient";
import { getCalendarEvents } from "@/app/actions/calendar-stats";

export const revalidate = 0;

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Jadwal & Kalender Penyewaan"
        subtitle="Visualisasi jadwal tanggal pengambilan, periode sewa aktif, dan batas pengembalian kostum."
        emoji="📅"
      />

      <CalendarClient initialEvents={events} />
    </div>
  );
}
