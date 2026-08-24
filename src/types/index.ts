// ─── Booking Status ────────────────────────────────────────────────────────
export type BookingStatus =
  | "BOOKING_BARU"
  | "SUDAH_DIBAYAR"
  | "KOSTUM_DISIAPKAN"
  | "SUDAH_DIAMBIL"
  | "SEDANG_DISEWA"
  | "SUDAH_DIKEMBALIKAN"
  | "SELESAI"
  | "DIBATALKAN";

// ─── Status Config (label, color, badge class) ─────────────────────────────
export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; badgeClass: string; color: string; step: number }
> = {
  BOOKING_BARU:          { label: "Booking Baru",          badgeClass: "badge badge-new",        color: "#EC4899", step: 0 },
  SUDAH_DIBAYAR:         { label: "Sudah Dibayar",         badgeClass: "badge badge-paid",       color: "#15803D", step: 1 },
  KOSTUM_DISIAPKAN:      { label: "Kostum Disiapkan",      badgeClass: "badge badge-processing", color: "#BE185D", step: 2 },
  SUDAH_DIAMBIL:         { label: "Sudah Diambil",         badgeClass: "badge badge-active",     color: "#6D28D9", step: 3 },
  SEDANG_DISEWA:         { label: "Sedang Disewa",         badgeClass: "badge badge-active",     color: "#6D28D9", step: 4 },
  SUDAH_DIKEMBALIKAN:    { label: "Sudah Dikembalikan",    badgeClass: "badge badge-processing", color: "#BE185D", step: 5 },
  SELESAI:               { label: "Selesai",               badgeClass: "badge badge-done",       color: "#166534", step: 6 },
  DIBATALKAN:            { label: "Dibatalkan",            badgeClass: "badge badge-cancelled",  color: "#DC2626", step: 7 },
};

// ─── Models ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  instagram: string;
  phone: string;
  address: string;
  totalRentals: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Costume {
  id: string;
  name: string;
  stock: number;
  available: number;
  borrowed: number;
  maintenance: number;
  popularity: number;
  price: number;
  imageUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TimelineEntry {
  id: string;
  bookingId: string;
  status: BookingStatus;
  updatedBy: string;
  comment?: string | null;
  createdAt: string | Date;
}

export interface Booking {
  id: string;
  bookingDate: string | Date;
  rentalStartDate: string | Date;
  rentalEndDate: string | Date;
  eventName?: string | null;
  paymentMethod: string;
  pickupMethod: string;
  totalAmount: number;
  notes?: string | null;
  attachmentUrl?: string | null;
  ktpUrl?: string | null;
  status: BookingStatus;
  customerId: string;
  costumeId: string;
  customer?: Customer;
  costume?: Costume;
  timeline?: TimelineEntry[];
  createdAt: string | Date;
  updatedAt: string | Date;
}


// ─── Dashboard Stats ───────────────────────────────────────────────────────
export interface DashboardStats {
  bookingBaru: number;
  sedangDiproses: number;
  sedangDisewa: number;
  selesaiBulanIni: number;
  totalCustomer: number;
  bookingHariIni: number;
}
