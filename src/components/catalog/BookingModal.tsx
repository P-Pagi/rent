"use client";

import { useState, useMemo, useEffect, FormEvent, useRef } from "react";
import Image from "next/image";
import {
  X, User, AtSign, Phone, MapPin, CalendarDays,
  CreditCard, Truck, StickyNote, CheckCircle, AlertCircle,
  Loader2, Star, ShoppingBag, Eye, QrCode, Download, ChevronLeft, ChevronRight, Info, FileImage, Camera,
  Package,
  ShieldCheck,
  Shirt,
  Lightbulb
} from "lucide-react";

export interface Costume {
  id: string;
  name: string;
  stock: number;
  available: number;
  borrowed: number;
  maintenance: number;
  imageUrl: string | null;
  popularity: number;
  price: number;
}

export interface BookingForm {
  name: string;
  instagram: string;
  phone: string;
  address: string;
  costumeId: string;
  costumeName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  eventName: string;
  paymentMethod: string;
  pickupMethod: string;
  notes: string;
}

const PAYMENT_OPTIONS = ["QRIS"];
const PICKUP_OPTIONS = ["Ambil Sendiri", "Kurir / Diantar"];

const EMPTY_FORM: BookingForm = {
  name: "", instagram: "", phone: "", address: "",
  costumeId: "", costumeName: "",
  rentalStartDate: "", rentalEndDate: "",
  eventName: "", paymentMethod: "QRIS", pickupMethod: "", notes: "",
};

export const getCostumePrice = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("premium") || lower.includes("frieren") || lower.includes("genshin") || lower.includes("armor")) {
    return 180000;
  }
  if (lower.includes("wig") || lower.includes("aksesoris")) {
    return 50000;
  }
  return 130000;
};

export const getPaymentFee = (_method: string) => 0;

const getMaxRentalEndDate = (startDate: string) => {
  if (!startDate) return "";
  const maxDate = new Date(`${startDate}T00:00:00`);
  maxDate.setDate(maxDate.getDate() + 4);
  return maxDate.toISOString().split("T")[0];
};

const extractFirstImageUrl = (imageUrl: string | null) =>
  imageUrl?.split(",").map((url) => url.trim()).filter(Boolean)[0] ?? null;

const extractImageUrls = (imageUrl: string | null) =>
  imageUrl?.split(",").map((url) => url.trim()).filter(Boolean) ?? [];

function SafeImageThumbnail({
  src,
  alt,
  fill,
  style,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-soft)" }}>
        <span style={{ fontSize: 20 }}>👘</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

function Badge({ available }: { available: number }) {
  if (available <= 0)
    return (
      <span
        style={{
          background: "rgba(239,68,68,0.08)",
          color: "#EF4444",
          border: "1px solid rgba(239,68,68,0.20)",
          borderRadius: 10,
          padding: "3px 9px",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        Habis Disewa
      </span>
    );
  if (available === 1)
    return (
      <span
        style={{
          background: "rgba(245,158,11,0.08)",
          color: "#D97706",
          border: "1px solid rgba(245,158,11,0.20)",
          borderRadius: 10,
          padding: "3px 9px",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        Sisa 1 Unit
      </span>
    );
  return (
    <span
      style={{
        background: "rgba(16,185,129,0.08)",
        color: "#059669",
        border: "1px solid rgba(16,185,129,0.20)",
        borderRadius: 10,
        padding: "3px 9px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      Tersedia ({available})
    </span>
  );
}

interface BookingModalProps {
  costume: Costume | null;
  isOpen: boolean;
  onClose: (resetAll?: boolean) => void;
}

export default function BookingModal({ costume, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<"detail" | "form" | "payment" | "success" | "error">("detail");
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpError, setKtpError] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const thumbnailNavRef = useRef<HTMLDivElement>(null);
  const ktpSectionRef = useRef<HTMLDivElement>(null);

  // Safe container-only scroll for thumbnail gallery
  useEffect(() => {
    if (!thumbnailNavRef.current) return;
    const container = thumbnailNavRef.current;
    const selectedEl = container.querySelector("[data-selected='true']") as HTMLElement;
    if (selectedEl) {
      const targetLeft = selectedEl.offsetLeft - container.clientWidth / 2 + selectedEl.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }
  }, [selectedPreviewUrl]);

  // Dynamic QRIS State
  const [qrisDataUrl, setQrisDataUrl] = useState<string | null>(null);
  const [qrisLoading, setQrisLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Initialize modal state when opened with costume
  useEffect(() => {
    if (isOpen && costume) {
      setStep("detail");
      setSelectedPreviewUrl(extractFirstImageUrl(costume.imageUrl));
      setErrorMsg("");
      setKtpError(false);
      setBookingId(null);
      setKtpFile(null);

      const savedIg = typeof window !== "undefined" ? localStorage.getItem("hana_rental_instagram") || "" : "";
      setForm((prev) => ({
        ...EMPTY_FORM,
        instagram: prev.instagram || savedIg,
        name: prev.name || "",
        phone: prev.phone || "",
        address: prev.address || "",
        costumeId: costume.id,
        costumeName: costume.name,
      }));
    }
  }, [isOpen, costume]);

  // Lock body scroll efficiently
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Load saved customer info from backend on mount if instagram is saved
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    const savedIg = localStorage.getItem("hana_rental_instagram");
    if (savedIg && !form.name) {
      fetch(`/api/public/customer?instagram=${encodeURIComponent(savedIg)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.found && data.customer) {
            setForm((p) => ({
              ...p,
              name: p.name || data.customer.name || "",
              phone: p.phone || data.customer.phone || "",
              address: p.address || data.customer.address || "",
            }));
          }
        })
        .catch((err) => console.error("Autofill loading error:", err));
    }
  }, [isOpen]);

  // Dynamic QRIS fetch on entering payment step
  useEffect(() => {
    if (step !== "payment" || !costume) return;

    const targetAmount = costume.price ?? getCostumePrice(form.costumeName);

    setQrisLoading(true);
    fetch("/api/qris/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: targetAmount,
        bookingId: `NOY-${Date.now().toString().slice(-6)}`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQrisDataUrl(data.qrDataUrl);
        }
      })
      .catch((err) => console.error("Gagal membuat QRIS Dynamic:", err))
      .finally(() => setQrisLoading(false));
  }, [step, costume, form.costumeName]);

  const handleInstagramBlur = async (igVal: string) => {
    if (!igVal.trim()) return;
    try {
      const res = await fetch(`/api/public/customer?instagram=${encodeURIComponent(igVal)}`);
      const data = await res.json();
      if (data.found && data.customer) {
        setForm((p) => ({
          ...p,
          name: p.name || data.customer.name || "",
          phone: p.phone || data.customer.phone || "",
          address: p.address || data.customer.address || "",
        }));
      }
    } catch (err) {
      console.error("Autofill fetch error:", err);
    }
  };

  const set = (key: keyof BookingForm, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleProceedToPayment = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setKtpError(false);

    const maxEndDate = getMaxRentalEndDate(form.rentalStartDate);
    if (form.rentalEndDate > maxEndDate) {
      setErrorMsg("Tanggal selesai maksimal 4 hari dari tanggal mulai.");
      return;
    }

    if (!ktpFile) {
      setKtpError(true);
      setErrorMsg("Foto KTP / KIA (Jaminan) wajib diunggah sebelum melanjutkan.");
      setTimeout(() => {
        ktpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setStep("payment");
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      let ktpUrl = "";
      if (ktpFile) {
        const formData = new FormData();
        formData.append("file", ktpFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal mengunggah KTP.");
        ktpUrl = uploadData.url;
      }

      const costumePrice = costume?.price ?? getCostumePrice(form.costumeName);

      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ktpUrl,
          paymentType: "FULL",
          totalAmount: costumePrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim pesanan.");
      setBookingId(data.bookingId ?? null);

      if (typeof window !== "undefined" && form.instagram) {
        localStorage.setItem("hana_rental_instagram", form.instagram);
      }

      setStep("success");
    } catch (err: any) {
      setErrorMsg(err.message);
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !costume) return null;

  return (
    <div
      onClick={() => onClose()}
      className="modal-overlay-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,19,43,0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fade-in 0.15s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="kawaii-card modal-card-responsive"
        style={{
          width: "100%",
          maxWidth: step === "detail" ? 820 : 540,
          maxHeight: "90vh",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          transition: "max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="modal-inner-scroll"
          style={{
            overflowY: "auto",
            maxHeight: "90vh",
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── STEP 1: Product Detail View ────── */}
          {step === "detail" && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => onClose()}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 32,
                  height: 32,
                  borderRadius: "25%",
                  border: "1px solid var(--border-soft)",
                  background: "var(--bg-soft)",
                  backdropFilter: "blur(12px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  zIndex: 20,
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <X size={16} color="var(--text-soft)" />
              </button>

              <div className="drawer-grid modal-grid-container" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: 0, minHeight: 460 }}>
                {/* Left Column: Premium Showcase Gallery */}
                <div
                  className="modal-gallery-container"
                  style={{
                    background: "var(--bg-soft)",
                    position: "relative",
                    minHeight: 420,
                    borderRight: "1px solid var(--border-soft)",
                    borderTopLeftRadius: 24,
                    borderBottomLeftRadius: 24,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Main Showcase Image Area */}
                  <div className="modal-image-area" style={{ position: "relative", flex: 1, minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {selectedPreviewUrl ? (
                      <>
                        {/* Crisp Main Image */}
                        <SafeImageThumbnail
                          key={selectedPreviewUrl}
                          src={selectedPreviewUrl}
                          alt={costume.name}
                          fill
                          className="modal-main-image"
                          style={{ objectFit: "contain", padding: "20px 20px 75px 20px", zIndex: 1, transition: "opacity 0.25s ease-in-out" }}
                        />
                      </>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 80 }}><Shirt /></span>
                      </div>
                    )}

                    {/* Carousel Navigation Arrows */}
                    {extractImageUrls(costume.imageUrl).length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const urls = extractImageUrls(costume.imageUrl);
                            const currentIdx = urls.indexOf(selectedPreviewUrl || "");
                            const prevIdx = currentIdx <= 0 ? urls.length - 1 : currentIdx - 1;
                            setSelectedPreviewUrl(urls[prevIdx]);
                          }}
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "45%",
                            transform: "translateY(-50%)",
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "rgba(15, 23, 42, 0.75)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 5,
                            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                            transition: "all 0.2s ease",
                          }}
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const urls = extractImageUrls(costume.imageUrl);
                            const currentIdx = urls.indexOf(selectedPreviewUrl || "");
                            const nextIdx = currentIdx >= urls.length - 1 ? 0 : currentIdx + 1;
                            setSelectedPreviewUrl(urls[nextIdx]);
                          }}
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "45%",
                            transform: "translateY(-50%)",
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "rgba(15, 23, 42, 0.75)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 5,
                            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                            transition: "all 0.2s ease",
                          }}
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Image Counter Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            background: "#ffffffff",
                            padding: "5px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 800,
                            zIndex: 5,
                            border: "1px solid rgba(255, 255, 255, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          }}
                        >
                          <Camera size={14} style={{ color: "#F472B6" }} />
                          {(extractImageUrls(costume.imageUrl).indexOf(selectedPreviewUrl || "") + 1) || 1} / {extractImageUrls(costume.imageUrl).length}
                        </div>
                      </>
                    )}

                    {/* Floating Glassmorphism Gallery Bar */}
                    {extractImageUrls(costume.imageUrl).length > 1 && (
                      <div
                        ref={thumbnailNavRef}
                        style={{
                          position: "absolute",
                          bottom: 12,
                          left: 12,
                          right: 12,
                          background: "#ffffffff",
                          borderRadius: 18,
                          padding: "8px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          overflowX: "auto",
                          scrollbarWidth: "none",
                          zIndex: 5,
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                        }}
                      >
                        {extractImageUrls(costume.imageUrl).map((url, index) => {
                          const isSelected = url === selectedPreviewUrl;
                          return (
                            <div
                              key={url}
                              data-selected={isSelected}
                              onClick={() => setSelectedPreviewUrl(url)}
                              style={{
                                width: 50,
                                height: 50,
                                minWidth: 50,
                                borderRadius: 12,
                                overflow: "hidden",
                                background: "rgba(255,255,255,0.1)",
                                border: isSelected ? "2px solid #F472B6" : "1px solid rgba(255,255,255,0.2)",
                                boxShadow: isSelected ? "0 0 12px rgba(244,114,182,0.7)" : "none",
                                transform: isSelected ? "scale(1.06)" : "scale(0.94)",
                                opacity: isSelected ? 1 : 0.65,
                                cursor: "pointer",
                                position: "relative",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            >
                              <SafeImageThumbnail
                                src={url}
                                alt={`${costume.name} preview ${index + 1}`}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Info Details */}
                <div className="modal-info-col" style={{ padding: "32px 28px 28px", display: "flex", flexDirection: "column", gap: 18, justifyContent: "center" }}>
                  <div>
                    <h2 style={{ fontSize: 19, fontWeight: 900, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.3, paddingRight: 32 }}>
                      {costume.name}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Badge available={costume.available} />
                      <div style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(245,158,11,0.06)", borderRadius: 8, padding: "2px 8px" }}>
                        <Star size={11} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)" }}>
                          5.0 (99%+ Puas)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 14, background: "var(--bg-soft)", borderRadius: 14, padding: "10px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase" }}>Harga Sewa</div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--primary)", marginTop: 2, whiteSpace: "nowrap" }}>
                        Rp {costume.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div style={{ width: 1, background: "var(--border)" }} />
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Stok Tersedia</div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: costume.available > 0 ? "var(--text)" : "#EF4444", marginTop: 2 }}>{costume.available} Unit</div>
                    </div>
                    <div style={{ width: 1, background: "var(--border)" }} />
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Sewa Aktif</div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-muted)", marginTop: 2 }}>{costume.borrowed} Unit</div>
                    </div>
                  </div>

                  {/* Costume Pack Inclusions */}
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: "var(--primary)" }}><Package size={14} /></span> Kelengkapan Sewa
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      <li>- Set Baju / Kostum Lengkap</li>
                      <li>- Wig / Rambut Palsu (sudah di-styling standar)</li>
                      <li>- Aksesoris Kepala / Prop Detail Kostum</li>
                      <li>- Sudah termasuk packing aman &amp; higienis</li>
                    </ul>
                  </div>

                  {/* Rental Rules & Terms */}
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: "var(--primary)" }}><ShieldCheck size={14} /></span> Syarat &amp; Ketentuan
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      <li>- Wajib menyertakan foto KTP/KIA sebelum pengiriman.</li>
                      <li>- Durasi sewa 4 Hari (Laundry gratis, tidak perlu dicuci sendiri).</li>
                      <li>- Keterlambatan pengembalian dikenakan denda Rp 25.000 / hari.</li>
                    </ul>
                  </div>

                  {/* Rent Action Button */}
                  <div style={{ marginTop: 10 }}>
                    {costume.maintenance > 0 ? (
                      <button
                        disabled
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          border: "1px solid rgba(239,68,68,0.2)",
                          background: "rgba(239,68,68,0.08)",
                          color: "#B91C1C",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <AlertCircle size={14} />
                        Sedang Maintenance, tidak bisa disewa
                      </button>
                    ) : costume.available > 0 ? (
                      <button
                        onClick={() => setStep("form")}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          border: "none",
                          background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow: "var(--shadow-sm)",
                          transition: "all 0.2s",
                        }}
                      >
                        <ShoppingBag size={14} />
                        Sewa Kostum Ini Sekarang
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/6281234567890?text=Halo%20noyrent.cos,%20saya%20ingin%20booking%20kostum%20${encodeURIComponent(costume.name)}%20yang%20sedang%20disewa.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--bg-soft)",
                          color: "var(--text-muted)",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          textDecoration: "none",
                          boxSizing: "border-box",
                          transition: "all 0.2s",
                        }}
                      >
                        <Info size={14} />
                        Hubungi Admin (Waiting List)
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Order Form ────── */}
          {step === "form" && (
            <div>
              <div
                style={{
                  padding: "20px 24px 16px",
                  borderBottom: "1px solid var(--border-soft)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  position: "sticky",
                  top: 0,
                  background: "var(--card)",
                  zIndex: 1,
                }}
              >
                <button
                  onClick={() => setStep("detail")}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-soft)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Sewa Kostum
                  </p>
                  <h2 style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                    {form.costumeName}
                  </h2>
                </div>
                <button
                  onClick={() => onClose()}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-soft)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-soft)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <form
                onSubmit={handleProceedToPayment}
                style={{
                  padding: "20px 24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <SectionTitle icon={<User size={13} />} title="Data Diri Pemesan" />

                <Field label="Nama Lengkap *" icon={<User size={12} />}>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Nama lengkap sesuai KTP/ID"
                    style={inputStyle}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Instagram *" icon={<AtSign size={12} />}>
                    <input
                      required
                      value={form.instagram}
                      onChange={(e) => set("instagram", e.target.value)}
                      onBlur={(e) => handleInstagramBlur(e.target.value)}
                      placeholder="@username"
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="No. WhatsApp (Aktif) *" icon={<Phone size={12} />}>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="08xxxxxxxx"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="Alamat Lengkap Pengiriman *" icon={<MapPin size={12} />}>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Tulis alamat rumah lengkap (RT/RW, No. Rumah, Kecamatan, Kota)"
                    rows={3}
                    style={{ ...inputStyle, height: "auto", resize: "none" }}
                  />
                </Field>

                <div
                  ref={ktpSectionRef}
                  style={{
                    borderRadius: 14,
                    padding: ktpError ? "12px" : "0px",
                    border: ktpError ? "2px solid #EF4444" : "1.5px solid transparent",
                    background: ktpError ? "rgba(239,68,68,0.06)" : "transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Field label="Foto KTP / KIA (Untuk Jaminan) *" icon={<FileImage size={12} />}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10,
                          border: ktpError ? "1.5px solid #EF4444" : "1px solid var(--border)",
                          background: "var(--card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          fontSize: 12, fontWeight: 700, color: "var(--text)", transition: "all 0.2s"
                        }}
                      >
                        <Camera size={14} style={{ color: ktpError ? "#EF4444" : "var(--primary)" }} />
                        Ambil Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10,
                          border: ktpError ? "1.5px solid #EF4444" : "1px solid var(--border)",
                          background: "var(--card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          fontSize: 12, fontWeight: 700, color: "var(--text)", transition: "all 0.2s"
                        }}
                      >
                        <FileImage size={14} style={{ color: ktpError ? "#EF4444" : "var(--primary)" }} />
                        Pilih File
                      </button>
                    </div>

                    {ktpError && !ktpFile && (
                      <div style={{ fontSize: 11.5, color: "#EF4444", fontWeight: 800, marginTop: 6, display: "flex", alignItems: "center", gap: 6, animation: "shake 0.3s ease" }}>
                        <AlertCircle size={14} />
                        Wajib unggah foto KTP/KIA sebagai jaminan sewa!
                      </div>
                    )}

                    {ktpFile && (
                      <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle size={12} />
                        File terpilih: {ktpFile.name}
                      </div>
                    )}

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setKtpFile(e.target.files[0]);
                          setErrorMsg("");
                          setKtpError(false);
                        }
                      }}
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setKtpFile(e.target.files[0]);
                          setErrorMsg("");
                          setKtpError(false);
                        }
                      }}
                    />
                  </Field>
                </div>

                <SectionTitle icon={<CalendarDays size={13} />} title="Detail Sewa Kostum" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Tanggal Mulai *" icon={<CalendarDays size={12} />}>
                    <input
                      required
                      type="date"
                      min={today}
                      value={form.rentalStartDate}
                      onChange={(e) => {
                        const rentalStartDate = e.target.value;
                        const maxEndDate = getMaxRentalEndDate(rentalStartDate);
                        setForm((previous) => ({
                          ...previous,
                          rentalStartDate,
                          rentalEndDate:
                            previous.rentalEndDate && previous.rentalEndDate <= maxEndDate
                              ? previous.rentalEndDate
                              : "",
                        }));
                      }}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Tanggal Selesai *" icon={<CalendarDays size={12} />}>
                    <input
                      required
                      type="date"
                      min={form.rentalStartDate || today}
                      max={getMaxRentalEndDate(form.rentalStartDate)}
                      value={form.rentalEndDate}
                      onChange={(e) => {
                        const rentalEndDate = e.target.value;
                        const maxEndDate = getMaxRentalEndDate(form.rentalStartDate);
                        set("rentalEndDate", maxEndDate && rentalEndDate > maxEndDate ? "" : rentalEndDate);
                      }}
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="Nama Event / Keperluan" icon={<ShoppingBag size={12} />}>
                  <input
                    value={form.eventName}
                    onChange={(e) => set("eventName", e.target.value)}
                    placeholder="Contoh: Comifuro, Foto Studio, Event Wibu (opsional)"
                    style={inputStyle}
                  />
                </Field>

                <SectionTitle icon={<CreditCard size={13} />} title="Metode & Catatan" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Metode Pembayaran *" icon={<CreditCard size={12} />}>
                    <select
                      required
                      value={form.paymentMethod}
                      onChange={(e) => set("paymentMethod", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Pilih Pembayaran</option>
                      {PAYMENT_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Metode Pengiriman *" icon={<Truck size={12} />}>
                    <select
                      required
                      value={form.pickupMethod}
                      onChange={(e) => set("pickupMethod", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Pilih Pengiriman</option>
                      {PICKUP_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Catatan / Keterangan Lain" icon={<StickyNote size={12} />}>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Ukuran kostum preferensi, aksesoris tambahan, dll. (opsional)"
                    rows={2}
                    style={{ ...inputStyle, height: "auto", resize: "none" }}
                  />
                </Field>

                {form.paymentMethod && (
                  <div
                    style={{
                      background: "var(--bg-soft)",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>Harga Sewa Kostum</span>
                      <span style={{ fontWeight: 800, color: "var(--text)" }}>
                        Rp {(costume?.price ?? getCostumePrice(form.costumeName)).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div style={{ height: 1, background: "var(--border)", opacity: 0.5, margin: "2px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                      <span style={{ color: "var(--text)", fontWeight: 900 }}>Total Pembayaran</span>
                      <span style={{ fontWeight: 900, color: "var(--primary)" }}>
                        Rp {((costume?.price ?? getCostumePrice(form.costumeName)) + getPaymentFee(form.paymentMethod)).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Error Alert ─────────────────────────────────────── */}
                {errorMsg && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      background: "rgba(239,68,68,0.08)",
                      border: "1.5px solid rgba(239,68,68,0.35)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      animation: "shake 0.3s ease",
                    }}
                  >
                    <AlertCircle size={16} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444", lineHeight: 1.5 }}>
                      {errorMsg}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: submitting
                      ? "var(--primary-light)"
                      : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    marginTop: 6,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} />
                      Lanjut ke Pembayaran &amp; Konfirmasi →
                    </>
                  )}
                </button>
              </form>
            </div>
          )}


          {/* ── STEP 3: Payment Instructions & Dynamic QRIS ────── */}
          {step === "payment" && (
            <div style={{ padding: "0" }}>
              <div
                style={{
                  padding: "18px 24px 14px",
                  borderBottom: "1px solid var(--border-soft)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  position: "sticky",
                  top: 0,
                  background: "var(--card)",
                  zIndex: 1,
                }}
              >
                <button
                  onClick={() => setStep("form")}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: "1px solid var(--border)", background: "var(--bg-soft)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Langkah 2 / 2: Pembayaran Dynamic QRIS
                  </p>
                  <h2 style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                    Scan QRIS &amp; Konfirmasi Pesanan
                  </h2>
                </div>
                <button
                  onClick={() => onClose()}
                  style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-soft)" }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    fontSize: 12.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 13 }}>
                    {form.costumeName}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11.5, display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarDays size={11} /> {form.rentalStartDate} s/d {form.rentalEndDate} • <User size={11} /> {form.name} ({form.phone})
                  </div>
                  <div style={{ color: "var(--text-soft)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                    <Package size={11} /> {form.pickupMethod} • <CreditCard size={11} /> Pembayaran QRIS
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-soft)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 18,
                    padding: "20px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card)", padding: "6px 14px", borderRadius: 20, border: "1px solid var(--border)" }}>
                    <QrCode size={16} style={{ color: "var(--primary)" }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text)" }}>
                      QRIS Noy.Rentcos
                    </span>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      width: 220,
                      height: 220,
                      background: "#FFFFFF",
                      borderRadius: 16,
                      padding: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #E2E8F0",
                    }}
                  >
                    {qrisLoading ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#64748B" }}>
                        <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: 11, fontWeight: 700 }}>Menggenerasi Dynamic QRIS...</span>
                      </div>
                    ) : qrisDataUrl ? (
                      <img
                        src={qrisDataUrl}
                        alt="QRIS Dynamic Payment Code"
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 700 }}>
                        Gagal memuat QR Code. Silakan refresh.
                      </span>
                    )}
                  </div>

                  <div style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 12, padding: "8px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase" }}>
                      Nominal Otomatis Terkunci di QRIS
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", marginTop: 2 }}>
                      Rp {(costume?.price ?? getCostumePrice(form.costumeName)).toLocaleString("id-ID")}
                    </div>
                  </div>

                  {qrisDataUrl && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                      <a
                        href={qrisDataUrl}
                        download={`qris-dynamic-${form.costumeName.replace(/[^a-zA-Z0-9]/g, "-")}.png`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          background: "var(--card)",
                          color: "var(--primary)",
                          fontSize: 11.5,
                          fontWeight: 700,
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Download size={13} />
                        Unduh QR Code
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ background: "var(--card)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={14} color="var(--primary)" />Cara Pembayaran QRIS Dynamic:</span>
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, Dana, ShopeePay, LinkAja).</li>
                    <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                    <li>Arahkan kamera HP ke Kode QRIS Dynamic di atas.</li>
                    <li>Nominal <strong>Rp {(costume?.price ?? getCostumePrice(form.costumeName)).toLocaleString("id-ID")}</strong> akan otomatis terisi secara presisi!</li>
                    <li>Konfirmasi pembayaran lalu tekan tombol di bawah untuk menyelesaikan pesanan.</li>
                  </ol>
                </div>

                {errorMsg && (
                  <div style={{ color: "#EF4444", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: submitting ? "var(--primary-light)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                      Mengirim Pesanan...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Konfirmasi &amp; Kirim Pesanan (via QRIS)
                    </>
                  )}
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setStep("form")}
                    style={{
                      flex: 1,
                      padding: "9px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "var(--bg-soft)",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ← Ubah Form
                  </button>
                  <button
                    onClick={() => onClose()}
                    style={{
                      flex: 1,
                      padding: "9px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: "var(--text-soft)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Success View ────── */}
          {step === "success" && (
            <div style={{ padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.10)",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={32} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>
                  Booking Berhasil Dikirim! 🎉
                </h3>
                {bookingId && (
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)", background: "rgba(236,72,153,0.06)", display: "inline-block", padding: "4px 12px", borderRadius: 8, marginTop: 4 }}>
                    ID Booking: #{bookingId.slice(-8).toUpperCase()}
                  </div>
                )}
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "10px 0 0", lineHeight: 1.6 }}>
                  Pesanan kamu telah resmi tercatat di sistem kami (Pembayaran via QRIS). Silakan kirim konfirmasi/bukti pembayaran ke WhatsApp Admin.
                </p>
              </div>

              {bookingId && (
                <a
                  href={`https://wa.me/6285174437275?text=${encodeURIComponent(
                    `Halo Noy.Rentcos! 🌸\n\nSaya baru saja membuat pesanan sewa kostum:\n` +
                    `- ID Booking: #${bookingId.slice(-8).toUpperCase()}\n` +
                    `- Nama Pemesan: ${form.name}\n` +
                    `- Kostum: ${form.costumeName}\n` +
                    `- Skema Pembayaran: QRIS\n` +
                    `- Total Nominal: Rp ${(costume?.price ?? getCostumePrice(form.costumeName)).toLocaleString("id-ID")}\n\n` +
                    `Mohon dikonfirmasi ya kak, terima kasih! ✨`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none",
                    boxSizing: "border-box",
                    boxShadow: "0 4px 14px rgba(37,211,102,0.25)",
                    fontFamily: "inherit",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.25 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.9 9.9 0 0 0-6.98-2.879C6.205 2.96 1.782 7.33 1.778 12.76c-.001 1.729.475 3.418 1.378 4.907L2.148 22.09l4.5-.754z" />
                  </svg>
                  Kirim Konfirmasi ke WhatsApp
                </a>
              )}

              <button
                onClick={() => onClose(true)}
                style={{
                  padding: "10px 28px",
                  borderRadius: 12,
                  background: "var(--bg-soft)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                Kembali ke Katalog
              </button>
            </div>
          )}

          {/* ── STEP 5: Error View ────── */}
          {step === "error" && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.10)",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={32} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
                Pemesanan Gagal
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 24px" }}>
                {errorMsg}
              </p>
              <button
                onClick={() => setStep("form")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 12,
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        paddingBottom: 4,
        borderBottom: "1px solid var(--border-soft)",
        marginTop: 6,
      }}
    >
      <div style={{ color: "var(--primary)" }}>{icon}</div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-soft)",
  color: "var(--text)",
  fontSize: 12.5,
  fontWeight: 600,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
