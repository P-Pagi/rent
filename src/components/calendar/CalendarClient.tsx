"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingDetailDrawer from "@/components/bookings/BookingDetailDrawer";
import { Booking } from "@/types";

interface CalendarClientProps {
  initialEvents: any[];
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* FullCalendar Card */}
      <div className="kawaii-card" style={{ padding: 24, overflow: "hidden" }}>
        <style jsx global>{`
          .fc {
            font-family: inherit;
          }
          .fc-header-toolbar {
            margin-bottom: 24px !important;
            gap: 12px !important;
            flex-wrap: wrap !important;
          }
          .fc-toolbar-title {
            font-size: 18px !important;
            font-weight: 700 !important;
            color: var(--text) !important;
            letter-spacing: -0.02em !important;
          }
          
          /* Custom styled buttons replacing solid harsh blue */
          .fc .fc-button-primary {
            background-color: var(--card) !important;
            background-image: none !important;
            border: 1px solid var(--border) !important;
            color: var(--text-muted) !important;
            font-weight: 600 !important;
            font-size: 12.5px !important;
            padding: 8px 14px !important;
            height: 38px !important;
            border-radius: 12px !important;
            box-shadow: var(--shadow-sm) !important;
            transition: all 0.2s ease !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            cursor: pointer !important;
            outline: none !important;
          }
          
          .fc .fc-button-primary:hover {
            background-color: var(--bg-soft) !important;
            color: var(--primary) !important;
            border-color: var(--primary-light) !important;
          }

          .fc .fc-button-primary:focus {
            box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important;
          }

          /* Active/Selected View State (e.g. Month vs Week) */
          .fc .fc-button-primary.fc-button-active {
            background-color: var(--primary) !important;
            border-color: var(--primary) !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(37,99,235,0.2) !important;
          }

          /* Separate buttons in group to prevent clumping */
          .fc .fc-button-group {
            gap: 6px !important;
          }
          .fc .fc-button-group > .fc-button {
            border-radius: 12px !important;
            margin-left: 0 !important;
          }

          /* Style 'today' button separately */
          .fc .fc-today-button {
            margin-left: 6px !important;
            background-color: var(--bg-soft) !important;
            color: var(--primary) !important;
            border-color: var(--primary-light) !important;
          }
          .fc .fc-today-button:disabled {
            opacity: 0.5 !important;
            background-color: var(--card) !important;
            border-color: var(--border) !important;
            color: var(--text-soft) !important;
            cursor: not-allowed !important;
          }

          /* Calendar Grid borders */
          .fc-daygrid-day {
            border-color: var(--border-soft) !important;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: var(--border-soft) !important;
          }
          .fc-col-header-cell {
            background: var(--bg-soft) !important;
            padding: 10px 0 !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            color: var(--text-muted) !important;
          }

          /* Custom Event styles */
          .fc-event {
            border-radius: 8px !important;
            padding: 3px 8px !important;
            font-size: 11.5px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            box-shadow: var(--shadow-sm) !important;
            border: none !important;
            margin: 2px 4px !important;
            transition: transform 0.15s ease, box-shadow 0.15s ease !important;
          }
          .fc-event:hover {
            transform: translateY(-1px) !important;
            box-shadow: var(--shadow-md) !important;
          }
        `}</style>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          events={initialEvents}
          eventClick={(info) => {
            if (info.event.extendedProps?.booking) {
              setSelectedBooking(info.event.extendedProps.booking);
            }
          }}
          height={650}
        />
      </div>

      {/* Booking Detail Modal Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
