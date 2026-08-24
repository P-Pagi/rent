import PageHeader from "@/components/shared/PageHeader";
import CustomersClient from "@/components/customers/CustomersClient";
import { getCustomers } from "@/app/actions/catalog";

export const revalidate = 0;

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Direktori Customer"
        subtitle="Daftar cosplayer dan pelanggan terdaftar, riwayat total sewa, kontak WhatsApp, dan alamat pengiriman."
        emoji="👥"
      />

      <CustomersClient initialCustomers={customers as any} />
    </div>
  );
}
