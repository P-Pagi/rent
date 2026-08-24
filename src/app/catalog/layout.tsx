import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Katalog Kostum | Noy.Rentcos Rental",
  description: "Jelajahi koleksi kostum anime & cosplay terlengkap. Sewa mudah tanpa perlu daftar!",
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
