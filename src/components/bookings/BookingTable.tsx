"use client";

import { useState, useMemo, useCallback } from "react";
import { getBookings } from "@/app/actions/booking";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Booking, BookingStatus, STATUS_CONFIG } from "@/types";
import StatusBadge from "@/components/shared/StatusBadge";
import SearchFilter from "@/components/shared/SearchFilter";
import BookingDetailDrawer from "@/components/bookings/BookingDetailDrawer";
import { Eye, ChevronLeft, ChevronRight, AtSign, Calendar, CreditCard, Truck } from "lucide-react";

interface BookingTableProps {
  initialBookings: Booking[];
}

const columnHelper = createColumnHelper<Booking>();

export default function BookingTable({ initialBookings }: BookingTableProps) {
  const [data, setData] = useState<Booking[]>(initialBookings);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const result = await getBookings({ limit: 1000 });
      setData(result.bookings as Booking[]);
      // Sync drawer dengan data terbaru
      if (selectedBooking) {
        const updated = result.bookings.find((b) => b.id === selectedBooking.id);
        if (updated) setSelectedBooking(updated as Booking);
      }
    } catch (e) {
      console.error("Gagal refresh data booking:", e);
    }
  }, [selectedBooking]);

  // Filter data by status if selected
  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((b) => b.status === statusFilter);
  }, [data, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("bookingDate", {
        header: "TANGGAL",
        cell: (info) => (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <Calendar size={13} />
            {new Date(info.getValue()).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        ),
      }),
      columnHelper.accessor("customer.name", {
        header: "CUSTOMER",
        cell: (info) => (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{info.getValue()}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>
              {info.row.original.customer?.phone}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("customer.instagram", {
        header: "INSTAGRAM",
        cell: (info) => (
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>
            <AtSign size={12} style={{ color: "var(--accent-dark)" }} />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("costume.name", {
        header: "KOSTUM",
        cell: (info) => (
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("eventName", {
        header: "EVENT",
        cell: (info) => (
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
            {info.getValue() || "-"}
          </div>
        ),
      }),
      columnHelper.accessor("paymentMethod", {
        header: "PAYMENT",
        cell: (info) => (
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <CreditCard size={12} /> {info.getValue()}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
              Rp{info.row.original.totalAmount.toLocaleString("id-ID")}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("pickupMethod", {
        header: "PICKUP",
        cell: (info) => (
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            <Truck size={12} /> {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "STATUS",
        cell: (info) => <StatusBadge status={info.getValue() as BookingStatus} size="sm" />,
      }),
      columnHelper.display({
        id: "actions",
        header: "ACTION",
        cell: (info) => (
          <button
            onClick={() => setSelectedBooking(info.row.original)}
            className="btn-ghost"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Eye size={13} /> Detail
          </button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const statusOptions = Object.entries(STATUS_CONFIG).map(([val, cfg]) => ({
    label: cfg.label,
    value: val,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search & Filters */}
      <SearchFilter
        placeholder="Cari customer, instagram, kostum, atau event…"
        value={globalFilter}
        onChange={setGlobalFilter}
        filters={[
          {
            key: "status",
            label: "Semua Status",
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Table Container */}
      <div className="kawaii-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        padding: "14px 16px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        letterSpacing: "0.05em",
                        cursor: header.column.getCanSort() ? "pointer" : "default",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
                    Tidak ada data booking yang sesuai filter.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid var(--border-soft)",
                      transition: "background-color 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={() => setSelectedBooking(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-soft)",
            fontSize: 12.5,
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          <div>
            Menampilkan halaman <strong>{table.getState().pagination.pageIndex + 1}</strong> dari{" "}
            <strong>{table.getPageCount() || 1}</strong> ({table.getFilteredRowModel().rows.length} total)
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 12,
                opacity: !table.getCanPreviousPage() ? 0.4 : 1,
                cursor: !table.getCanPreviousPage() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn-ghost"
              style={{
                padding: "6px 12px",
                fontSize: 12,
                opacity: !table.getCanNextPage() ? 0.4 : 1,
                cursor: !table.getCanNextPage() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdated={refreshData}
      />
    </div>
  );
}
