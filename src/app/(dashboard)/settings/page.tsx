import PageHeader from "@/components/shared/PageHeader";
import SettingsClient from "@/components/settings/SettingsClient";

export const revalidate = 0;

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Pengaturan Sistem"
        subtitle="Kelola sinkronisasi Google Sheets, tema tampilan, notifikasi, dan profil akun admin."
        emoji="⚙️"
      />

      <SettingsClient />
    </div>
  );
}
