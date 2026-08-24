"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Search, Package, ChevronRight, ChevronLeft,
  CalendarDays, Star, AlertCircle, HelpCircle, Eye,
  Shirt, MessageCircle, Sparkles, ShieldCheck, Heart
} from "lucide-react";
import BackgroundDecorations from "@/components/layout/BackgroundDecorations";
import type { Costume } from "./BookingModal";

function InstagramIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function WhatsAppIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.001 5.45-4.436 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Lazy Loaded Modal Components for light initial bundle & high performance
const BookingModal = dynamic(() => import("./BookingModal"), {
  ssr: false,
});

const HistoryModal = dynamic(() => import("./HistoryModal"), {
  ssr: false,
});

// Helper for prewarming modal chunks on user hover
const preloadBookingModal = () => {
  import("./BookingModal");
};

const preloadHistoryModal = () => {
  import("./HistoryModal");
};

const extractImageUrls = (imageUrl: string | null) =>
  imageUrl?.split(",").map((url) => url.trim()).filter(Boolean) ?? [];

function SafeCostumeImage({
  imageUrl,
  alt,
  fill,
  style,
  className,
}: {
  imageUrl: string | null;
  alt: string;
  fill?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const urls = useMemo(() => extractImageUrls(imageUrl), [imageUrl]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
  }, [imageUrl]);

  if (hasError || urls.length === 0 || currentIndex >= urls.length) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 60 }}>👘</span>
      </div>
    );
  }

  return (
    <>
      <Image
        key={urls[currentIndex]}
        src={urls[currentIndex]}
        alt={alt}
        fill={fill}
        style={style}
        className={className}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        onError={() => {
          if (currentIndex + 1 < urls.length) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setHasError(true);
          }
        }}
      />
      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
            }}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
            }}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>

          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(8px)",
              padding: "4px 8px",
              borderRadius: 99,
              zIndex: 4,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {(() => {
              const total = urls.length;
              let start = Math.max(0, currentIndex - 2);
              let end = Math.min(total - 1, start + 3);
              if (end - start < 3 && total >= 4) {
                start = Math.max(0, end - 3);
              }
              const dots = [];
              for (let i = start; i <= end; i++) dots.push(i);

              return dots.map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  style={{
                    width: idx === currentIndex ? 12 : 5,
                    height: 5,
                    borderRadius: 99,
                    background: idx === currentIndex ? "var(--bg-soft)" : "rgba(255, 255, 255, 0.5)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ));
            })()}
            <span style={{ fontSize: 10, fontWeight: 700, color: "white", marginLeft: 3 }}>
              {currentIndex + 1}/{urls.length}
            </span>
          </div>
        </>
      )}
    </>
  );
}

function Badge({ available }: { available: number }) {
  if (available <= 0)
    return (
      <span
        style={{
          alignSelf: "flex-start",
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
          alignSelf: "flex-start",
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
        alignSelf: "flex-start",
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

export default function CatalogClient({ costumes }: { costumes: Costume[] }) {
  const [search, setSearch] = useState("");
  const [filterAvail, setFilterAvail] = useState<"all" | "available" | "unavailable">("all");
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  // Modal Control States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [userInstagram, setUserInstagram] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIg = localStorage.getItem("hana_rental_instagram");
      if (savedIg) setUserInstagram(savedIg);
    }
  }, []);

  const filtered = useMemo(() => {
    return costumes.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const matchAvail =
        filterAvail === "all" ? true :
          filterAvail === "available" ? c.available > 0 :
            c.available <= 0;
      const matchSeries = !selectedSeries || c.name.toLowerCase().includes(`(${selectedSeries.toLowerCase()})`);
      return matchSearch && matchAvail && matchSeries;
    });
  }, [costumes, search, filterAvail, selectedSeries]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCostumes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (val: "all" | "available" | "unavailable") => {
    setFilterAvail(val);
    setCurrentPage(1);
  };

  const getPageRange = (current: number, total: number) => {
    const range: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  const openModal = (c: Costume) => {
    setSelectedCostume(c);
    setModalOpen(true);
  };

  const closeModal = (resetAll = false) => {
    setModalOpen(false);
    if (resetAll) {
      setTimeout(() => setSelectedCostume(null), 200);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        position: "relative",
        overflowX: "hidden",
        paddingBottom: 0,
      }}
    >
      <BackgroundDecorations />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        style={{
          height: 72,
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(244, 114, 182, 0.22)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 4px 25px rgba(244, 114, 182, 0.08)",
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/image/logo.png"
            alt="noyrent.cos Logo"
            style={{ height: 42, width: "auto", objectFit: "contain" }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* Center: Interactive Nav Menu */}
        <div
          className="desktop-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: "rgba(255, 255, 255, 0.75)",
            border: "1px solid var(--border)",
            padding: "6px 18px",
            borderRadius: 99,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
            marginRight: 16,
          }}
        >
          <a
            href="#catalog"
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--primary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Shirt size={14} />
            Katalog
          </a>

          <div style={{ width: 1, height: 14, background: "var(--border)" }} />

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20noyrent.cos,%20saya%20ingin%20tanya%20sewa%20kostum"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#059669")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <WhatsAppIcon size={14} color="#10B981" />
            Tanya Admin
          </a>

          <div style={{ width: 1, height: 14, background: "var(--border)" }} />

          <a
            href="https://instagram.com/noyrent.cos"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <InstagramIcon size={14} />
            @noyrent.cos
          </a>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => {
              preloadHistoryModal();
              setHistoryModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: 14,
              border: "1px solid var(--primary-light)",
              background: "rgba(244, 114, 182, 0.08)",
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(244,114,182,0.12)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--primary)";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(244, 114, 182, 0.08)";
              e.currentTarget.style.color = "var(--primary)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <CalendarDays size={15} />
            Cek Orderan
          </button>
        </div>
      </nav>

      {/* ── Hero / Intro ─────────────────────────────────────── */}
      <header
        style={{
          maxWidth: 780,
          margin: "44px auto 32px",
          padding: "0 20px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1
          className="gradient-text-ocean"
          style={{
            fontSize: "clamp(26px, 6vw, 44px)",
            fontWeight: 900,
            margin: "0 0 12px",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          Katalog Kostum Cosplay
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14.5,
            lineHeight: 1.6,
            margin: "0 auto 28px",
            maxWidth: 580,
          }}
        >
          Temukan koleksi kostum anime favoritmu. Klik kostum pilihanmu untuk melihat detail item dan kelengkapan aksesoris.
        </p>

        {/* Search Bar */}
        <div
          className="glass"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            borderRadius: 20,
            padding: "6px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div style={{ paddingLeft: 12, display: "flex", alignItems: "center", color: "var(--text-soft)" }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari kostum anime, karakter..."
            style={{
              flex: 1,
              height: 40,
              border: "none",
              background: "transparent",
              color: "var(--text)",
              fontSize: 13.5,
              fontWeight: 600,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </header>

      {/* ── Toolbar & Filter ────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto 28px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <Shirt size={14} style={{ color: "var(--primary)" }} />
          Menampilkan {filtered.length} Koleksi Kostum
        </div>

        <div>
          <select
            aria-label="Filter koleksi kostum"
            value={filterAvail}
            onChange={(e) => handleFilterChange(e.target.value as "all" | "available" | "unavailable")}
            style={{
              padding: "7px 32px 7px 12px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid var(--border)",
              background: "var(--bg-soft)",
              color: "var(--text-muted)",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="all">Semua Koleksi</option>
            <option value="available">Tersedia</option>
            <option value="unavailable">Sedang Disewa</option>
          </select>
        </div>
      </section>

      {/* ── Costume Grid ─────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {paginatedCostumes.length === 0 ? (
          <div
            className="kawaii-card"
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <HelpCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Kostum tidak ditemukan</p>
            <p style={{ fontSize: 12, color: "var(--text-soft)", margin: "4px 0 0" }}>Coba cari nama kostum atau karakter anime lain.</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 20,
              }}
            >
              {paginatedCostumes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    preloadBookingModal();
                    openModal(c);
                  }}
                  role="button"
                  tabIndex={0}
                  className="kawaii-card"
                  style={{
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--card)",
                  }}
                >
                  {/* Image Cover */}
                  <div
                    style={{
                      height: 240,
                      background: "var(--bg-soft)",
                      position: "relative",
                      overflow: "hidden",
                      borderBottom: "1px solid var(--border-soft)",
                    }}
                  >
                    <SafeCostumeImage
                      imageUrl={c.imageUrl}
                      alt={c.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="costume-image-hover"
                    />

                    {/* Popularity Badge */}
                    {c.popularity > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "var(--glass-bg)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: 10,
                          padding: "4px 10px",
                        }}
                      >
                        <Star size={11} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text)" }}>
                          {c.popularity} Sewa
                        </span>
                      </div>
                    )}

                    {c.maintenance > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          background: "rgba(239, 68, 68, 0.95)",
                          color: "white",
                          borderRadius: 10,
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <AlertCircle size={12} />
                        Maintenance
                      </div>
                    )}
                  </div>

                  {/* Info Container */}
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--text)",
                        margin: 0,
                        lineHeight: 1.4,
                        flex: 1,
                      }}
                    >
                      {c.name}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "auto",
                        paddingTop: 8,
                        borderTop: "1px solid var(--border-soft)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <Badge available={c.available} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--primary)" }}>
                          Rp {c.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--primary)",
                          alignSelf: "flex-end",
                        }}
                      >
                        Detail
                        <Eye size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination Controls ─────────────────────────────────── */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 40,
                }}
              >
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  style={{
                    width: 36, height: 36, borderRadius: 12, border: "1px solid var(--border)",
                    background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1,
                    transition: "all 0.2s", color: "var(--text-muted)",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageRange(currentPage, totalPages).map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span
                        key={`ell-${idx}`}
                        style={{
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-soft)",
                          fontWeight: 700,
                        }}
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      style={{
                        width: 36, height: 36, borderRadius: 12,
                        border: p === currentPage ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: p === currentPage ? "var(--primary)" : "var(--card)",
                        color: p === currentPage ? "white" : "var(--text-muted)",
                        fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  style={{
                    width: 36, height: 36, borderRadius: 12, border: "1px solid var(--border)",
                    background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1,
                    transition: "all 0.2s", color: "var(--text-muted)",
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        style={{
          marginTop: 80,
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          padding: "50px 24px 30px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 36,
            paddingBottom: 36,
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img src="/image/logo.png" alt="noyrent.cos Logo" style={{ height: 36, width: "auto" }} />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
              Rental kostum cosplay &amp; anime premium terpercaya. Tampil maksimal dan ciptakan momen impian di setiap event cosplay.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href="https://instagram.com/noyrent.cos"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--primary)", transition: "all 0.2s", textDecoration: "none"
                }}
                aria-label="Instagram @noyrent.cos"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#10B981", transition: "all 0.2s", textDecoration: "none"
                }}
                aria-label="WhatsApp Admin"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          {/* Ketentuan Sewa */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Ketentuan Sewa
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, color: "var(--text-muted)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} style={{ color: "var(--primary)", flexShrink: 0 }} /> Wajib sertakan foto KTP / KIA sebelum pengiriman
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={14} style={{ color: "var(--primary)", flexShrink: 0 }} /> Free Laundry (Kostum tidak perlu dicuci sendiri)
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={14} style={{ color: "var(--primary)", flexShrink: 0 }} /> Durasi 4 Hari (Termasuk hari kirim &amp; balik)
              </li>
            </ul>
          </div>

          {/* Layanan Admin */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Layanan Admin
            </h4>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 8px" }}>
              <strong>Jam Operasional:</strong><br />
              Senin - Minggu: 09:00 - 21:00 WIB
            </p>
            <p style={{ fontSize: 12, color: "var(--text-soft)", margin: 0 }}>
              Respons cepat via DM Instagram <strong>@noyrent.cos</strong>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ maxWidth: 1100, margin: "24px auto 0", textAlign: "center", fontSize: 12, color: "var(--text-soft)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span>© {new Date().getFullYear()} <strong>noyrent.cos</strong>. Made with</span>
          <Heart size={12} fill="#EC4899" color="#EC4899" />
          <span>for Cosplayers.</span>
        </div>
      </footer>

      {/* ── Lazy Loaded Modals ────────────────────────────────────────── */}
      <BookingModal
        costume={selectedCostume}
        isOpen={modalOpen}
        onClose={closeModal}
      />

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        initialInstagram={userInstagram}
      />
    </div>
  );
}
