"use client";

import { useState, useMemo } from "react";
import { Customer } from "@/types";
import CustomerCard from "@/components/shared/CustomerCard";
import SearchFilter from "@/components/shared/SearchFilter";
import EmptyState from "@/components/shared/EmptyState";

interface CustomerWithBookingDate extends Customer {
  bookings?: { bookingDate: string | Date }[];
}

interface CustomersClientProps {
  initialCustomers: CustomerWithBookingDate[];
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return initialCustomers;
    const s = search.toLowerCase();
    return initialCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.instagram.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s) ||
        c.address.toLowerCase().includes(s)
    );
  }, [initialCustomers, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search Bar */}
      <SearchFilter
        placeholder="Cari nama, @instagram, whatsapp, atau alamat customer…"
        value={search}
        onChange={setSearch}
      />

      {/* Customers Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="Tidak Ada Customer Ditemukan"
          description="Tidak menemukan customer yang cocok dengan kata kunci pencarian kamu."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((cust) => (
            <CustomerCard
              key={cust.id}
              customer={cust}
              lastBookingDate={cust.bookings?.[0]?.bookingDate as unknown as string}
            />
          ))}
        </div>
      )}
    </div>
  );
}
