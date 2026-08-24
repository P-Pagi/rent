"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X, Save } from "lucide-react";
import { Costume } from "@/types";
import CostumeCard from "@/components/shared/CostumeCard";
import SearchFilter from "@/components/shared/SearchFilter";
import EmptyState from "@/components/shared/EmptyState";
import { createCostume, updateCostume, deleteCostume, finishMaintenance } from "@/app/actions/catalog";

interface CostumesClientProps {
  initialCostumes: Costume[];
}

interface CostumeDraft {
  name: string;
  stock: number;
  popularity: number;
  maintenance: number;
  price: number;
  imageUrl: string;
}

const EMPTY_DRAFT: CostumeDraft = {
  name: "",
  stock: 1,
  popularity: 0,
  maintenance: 0,
  price: 0,
  imageUrl: "",
};

function AdminImageThumbnail({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: error ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
        background: error ? "rgba(239,68,68,0.06)" : "var(--card)",
        minHeight: 90,
        height: 90,
        position: "relative",
      }}
    >
      {error ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: 6,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 10, color: "#EF4444", fontWeight: 800 }}>
            Gambar Rusak
          </span>
          <span style={{ fontSize: 9, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", whiteSpace: "nowrap" }}>
            {url.split("/").pop()}
          </span>
        </div>
      ) : (
        <img
          src={url}
          alt={`Preview kostum ${index + 1}`}
          onError={() => setError(true)}
          style={{
            width: "100%",
            height: 90,
            objectFit: "cover",
          }}
        />
      )}
      <button
        type="button"
        onClick={() => onRemove(index)}
        title="Hapus gambar ini"
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.85)",
          background: "rgba(15,23,42,0.85)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 2,
          fontSize: 14,
          fontWeight: "bold",
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function CostumesClient({ initialCostumes }: CostumesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "AVAILABLE" | "BORROWED" | "MAINTENANCE">("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CostumeDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const mounted = typeof window !== "undefined";

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const costumeImages = useMemo(() => {
    return draft.imageUrl
      ?.split(",")
      .map((url) => url.trim())
      .filter(Boolean) ?? [];
  }, [draft.imageUrl]);

  const handleRemoveImage = (indexToRemove: number) => {
    setDraft((prev) => {
      const current = prev.imageUrl
        ?.split(",")
        .map((url) => url.trim())
        .filter(Boolean) ?? [];
      const updated = current.filter((_, i) => i !== indexToRemove);
      return { ...prev, imageUrl: updated.join(", ") };
    });
  };

  const handleRemoveAllImages = () => {
    setDraft((prev) => ({ ...prev, imageUrl: "" }));
  };

  useEffect(() => {
    if (!isFormOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen]);

  const filtered = useMemo(() => {
    return initialCostumes.filter((c) => {
      const matchSearch =
        !search || c.name.toLowerCase().includes(search.toLowerCase());

      let matchTab = true;
      if (filterTab === "AVAILABLE") matchTab = c.available > 0;
      if (filterTab === "BORROWED")  matchTab = c.borrowed > 0;
      if (filterTab === "MAINTENANCE") matchTab = c.maintenance > 0;

      return matchSearch && matchTab;
    });
  }, [initialCostumes, search, filterTab]);

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setNotice(null);
    setIsFormOpen(true);
  };

  const openEditModal = (costume: Costume) => {
    setEditingId(costume.id);
    setDraft({
      name: costume.name,
      stock: costume.stock,
      popularity: costume.popularity,
      maintenance: costume.maintenance ?? 0,
      price: costume.price ?? 0,
      imageUrl: costume.imageUrl || "",
    });
    setNotice(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setNotice(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      if (editingId) {
        await updateCostume(editingId, draft);
      } else {
        await createCostume(draft);
      }
      closeForm();
      router.refresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal menyimpan kostum.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (costume: Costume) => {
    if (!window.confirm(`Hapus kostum ${costume.name}?`)) return;

    try {
      await deleteCostume(costume.id);
      setNotice(`${costume.name} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal menghapus kostum.");
    }
  };

  const handleFinishMaintenance = async (costumeId: string) => {
    try {
      await finishMaintenance(costumeId);
      setNotice("Status cuci/maintenance selesai! Stok kembali tersedia. ✨");
      router.refresh();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal menyelesaikan maintenance.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setNotice(files.length > 1 ? `Mengunggah ${files.length} gambar...` : "Mengunggah gambar...");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
      }

      const uploadedUrls: string[] = Array.isArray(data.urls)
        ? data.urls
        : data.url
        ? [data.url]
        : [];

      if (uploadedUrls.length === 0) {
        throw new Error("Tidak ada URL gambar yang dikembalikan.");
      }

      setDraft((prev) => {
        const existing = prev.imageUrl
          ?.split(",")
          .map((url) => url.trim())
          .filter(Boolean) ?? [];
        const merged = [...new Set([...existing, ...uploadedUrls])];
        return { ...prev, imageUrl: merged.join(", ") };
      });

      setNotice(`${uploadedUrls.length} gambar baru berhasil ditambahkan.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <style jsx global>{`
        .costume-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 14, 28, 0.72);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          z-index: 1000;
        }

        .costume-modal-card {
          width: min(100%, 560px);
          max-height: 95vh;
          overflow-y: auto;
          padding: 22px;
          border-radius: 22px;
          box-shadow: var(--shadow-lg);
          background: var(--card);
        }

        .costume-form-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
        }

        .costume-form-field {
          display: grid;
          gap: 6px;
        }

        .costume-form-input {
          width: 100%;
          min-height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-soft);
          padding: 0 12px;
          color: var(--text);
          font-family: inherit;
          font-size: 13px;
          box-sizing: border-box;
        }

        .costume-upload-box {
          display: grid;
          gap: 8px;
          border: 1px dashed var(--border);
          border-radius: 14px;
          padding: 12px;
          background: rgba(139, 92, 246, 0.06);
        }

        .costume-upload-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.24);
          background: rgba(139, 92, 246, 0.12);
          color: var(--primary);
          font-size: 12.5px;
          font-weight: 800;
          cursor: pointer;
          padding: 0 12px;
          width: 100%;
        }

        .costume-preview-grid {
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .costume-action-row {
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .costume-action-row button {
          width: 100%;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .costume-modal-overlay {
            padding: 16px;
            align-items: center;
          }

          .costume-modal-card {
            border-radius: 24px;
            padding: 22px;
          }

          .costume-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .costume-preview-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .costume-action-row {
            flex-direction: row;
          }

          .costume-action-row button {
            width: auto;
          }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* Search & Filter Bar */}
      <SearchFilter
        placeholder="Cari nama kostum atau karakter…"
        value={search}
        onChange={setSearch}
        extra={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={openCreateModal}
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 14,
                border: "1px solid var(--primary)",
                background: "rgba(139,92,246,0.12)",
                color: "var(--primary)",
                fontSize: 12.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={14} />
              Tambah Kostum
            </button>

            {[
              { id: "ALL",         label: "Semua" },
              { id: "AVAILABLE",   label: "Tersedia" },
              { id: "BORROWED",    label: "Sedang Disewa" },
              { id: "MAINTENANCE", label: "Maintenance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as "ALL" | "AVAILABLE" | "BORROWED" | "MAINTENANCE")}
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 14,
                  border: filterTab === tab.id
                    ? "1.5px solid var(--primary)"
                    : "1.5px solid var(--border)",
                  background: filterTab === tab.id
                    ? "rgba(139,92,246,0.12)"
                    : "var(--card)",
                  color: filterTab === tab.id
                    ? "var(--primary)"
                    : "var(--text-muted)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {notice && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(139,92,246,0.10)",
            border: "1px solid rgba(139,92,246,0.20)",
            color: "var(--text)",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          {notice}
        </div>
      )}

      {isFormOpen && mounted && createPortal(
        <div onClick={closeForm} className="costume-modal-overlay">
          <div onClick={(e) => e.stopPropagation()} className="kawaii-card costume-modal-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
                  {editingId ? "Edit Kostum" : "Tambah Kostum Baru"}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-muted)" }}>
                  Isi data lengkap untuk menambah item katalog baru atau mengubah data yang sudah ada.
                </p>
              </div>
              <button
                onClick={closeForm}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
              <div className="costume-form-grid">
                <label className="costume-form-field">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)" }}>Nama Kostum</span>
                  <input
                    required
                    value={draft.name}
                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Contoh: Kamado Nezuko"
                    className="costume-form-input"
                  />
                </label>

                <label className="costume-form-field">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)" }}>Stok Unit</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={draft.stock}
                    onChange={(e) => setDraft((p) => ({ ...p, stock: Number(e.target.value) }))}
                    className="costume-form-input"
                  />
                </label>
              </div>

              <div className="costume-form-grid">
                <label className="costume-form-field">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)" }}>Popularity</span>
                  <input
                    type="number"
                    min={0}
                    value={draft.popularity}
                    onChange={(e) => setDraft((p) => ({ ...p, popularity: Number(e.target.value) }))}
                    className="costume-form-input"
                  />
                </label>

                <label className="costume-form-field">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)" }}>Harga Sewa</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={draft.price ? formatRupiah(draft.price) : "Rp 0"}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                      setDraft((p) => ({ ...p, price: Number(onlyDigits) }));
                    }}
                    placeholder="Rp 0"
                    className="costume-form-input"
                  />
                </label>
              </div>

              <div className="costume-form-grid">
                <label className="costume-form-field">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)" }}>Maintenance</span>
                  <input
                    type="number"
                    min={0}
                    value={draft.maintenance}
                    onChange={(e) => setDraft((p) => ({ ...p, maintenance: Number(e.target.value) }))}
                    className="costume-form-input"
                  />
                </label>

                <label className="costume-form-field">
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)" }}>Gambar / URL</span>
                  <input
                    value={draft.imageUrl}
                    onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://... atau pilih gambar"
                    className="costume-form-input"
                  />
                </label>
              </div>

              <div className="costume-upload-box">
                <label className="costume-upload-button" style={{ opacity: uploading ? 0.7 : 1, cursor: uploading ? "wait" : "pointer" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Plus size={14} />
                    {uploading ? "Mengunggah..." : "Pilih beberapa gambar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Kamu bisa memilih banyak foto sekaligus. Foto baru yang dipilih akan ditambahkan ke daftar tanpa menghapus foto sebelumnya.
                </div>
              </div>

              {costumeImages.length > 0 && (
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--bg-soft)",
                    padding: 12,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", flex: 1 }}>
                      {costumeImages.length} gambar terpilih untuk kostum ini.
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={handleRemoveAllImages}
                        style={{
                          height: 34,
                          padding: "0 12px",
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--card)",
                          color: "var(--text-muted)",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Hapus Semua
                      </button>
                    </div>
                  </div>

                  <div className="costume-preview-grid">
                    {costumeImages.map((url, index) => (
                      <AdminImageThumbnail
                        key={`${url}-${index}`}
                        url={url}
                        index={index}
                        onRemove={handleRemoveImage}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="costume-action-row">
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text-muted)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    color: "white",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Save size={14} />
                  {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Kostum"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Costume Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="👘"
          title="Tidak Ada Kostum Ditemukan"
          description="Coba ubah kata kunci pencarian atau filter ketersediaan stok kamu."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          {filtered.map((costume) => (
            <CostumeCard
              key={costume.id}
              costume={costume}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onFinishMaintenance={handleFinishMaintenance}
            />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
