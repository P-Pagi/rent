import { useState } from "react";
import Image from "next/image";
import { Shirt, Star, Package, Wrench, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Costume } from "@/types";

interface CostumeCardProps {
  costume: Costume;
  onClick?: (costume: Costume) => void;
  onEdit?: (costume: Costume) => void;
  onDelete?: (costume: Costume) => void;
  onFinishMaintenance?: (costumeId: string) => void;
}

export default function CostumeCard({ costume, onClick, onEdit, onDelete, onFinishMaintenance }: CostumeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const availPct = costume.stock > 0 ? (costume.available / costume.stock) * 100 : 0;
  const imageUrls = costume.imageUrl?.split(",").map((url) => url.trim()).filter(Boolean) ?? [];
  const currentImageUrl = imageUrls[currentIndex] ?? imageUrls[0] ?? null;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const statusChips = [
    { label: `${costume.available} Tersedia`, color: "#86EFAC", bg: "rgba(134,239,172,0.18)" },
    { label: `${costume.borrowed} Disewa`, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
    { label: `${costume.maintenance} Servis`, color: "#FCD34D", bg: "rgba(252,211,77,0.18)" },
  ];

  return (
    <div
      className="kawaii-card"
      onClick={() => onClick?.(costume)}
      style={{
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Image Container */}
      <div
        style={{
          aspectRatio: "4 / 3",
          width: "100%",
          background: "linear-gradient(135deg, #F3E8FF, #FCE7F3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {currentImageUrl && !imageError ? (
          <>
            <Image
              key={currentImageUrl}
              src={currentImageUrl}
              alt={`${costume.name} - ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              style={{ objectFit: "cover", transition: "opacity 0.3s ease" }}
              unoptimized
              onError={() => setImageError(true)}
            />

            {/* Carousel Navigation Arrows */}
            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
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
                    transition: "all 0.2s",
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleNextImage}
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
                    transition: "all 0.2s",
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Pagination Dots & Counter Pill */}
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
                    const total = imageUrls.length;
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
                        onClick={(e) => handleDotClick(e, idx)}
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
                    {currentIndex + 1}/{imageUrls.length}
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Shirt size={40} style={{ color: "var(--primary-light)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
              No Image
            </span>
          </div>
        )}

        {/* Popularity badge overlay */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(8px)",
            padding: "4px 9px",
            borderRadius: 99,
            fontSize: 11.5,
            fontWeight: 700,
            color: "#B45309",
          }}
        >
          <Star size={11} fill="#FCD34D" stroke="none" />
          {costume.popularity}
        </div>

        {/* Stock pill */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(8px)",
            padding: "3px 9px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Package size={10} />
          Stok: {costume.stock}
        </div>
      </div>

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            gap: 6,
            zIndex: 3,
          }}
        >
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(costume);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label={`Edit ${costume.name}`}
            >
              <Pencil size={13} color="var(--primary)" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(costume);
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.26)",
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label={`Delete ${costume.name}`}
            >
              <Trash2 size={13} color="#EF4444" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 144 }}>
        <h3
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 2,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {costume.name}
        </h3>

        {/* Availability bar */}
        <div style={{ marginBottom: 1, marginTop: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontSize: 11,
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            <span>Ketersediaan</span>
            <span>{Math.round(availPct)}%</span>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--border)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${availPct}%`,
                background:
                  availPct > 60
                    ? "linear-gradient(90deg, #86EFAC, #4ADE80)"
                    : availPct > 30
                      ? "linear-gradient(90deg, #FCD34D, #F59E0B)"
                      : "linear-gradient(90deg, #FCA5A5, #F87171)",
                borderRadius: 99,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Status chips */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          {statusChips.map((chip) => (
            <span
              key={chip.label}
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                color: chip.color,
                background: chip.bg,
              }}
            >
              {chip.label}
            </span>
          ))}
        </div>

        {/* Maintenance warning */}
        {costume.maintenance > 0 && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
              fontSize: 11,
              color: "#B45309",
              fontWeight: 600,
              background: "rgba(252,211,77,0.12)",
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid rgba(252,211,77,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Wrench size={12} />
              <span>{costume.maintenance} unit cuci / QC</span>
            </div>
            {onFinishMaintenance && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFinishMaintenance(costume.id);
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(16,185,129,0.4)",
                  background: "#10B981",
                  color: "white",
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(16,185,129,0.2)",
                }}
              >
                ✓ Selesai Cuci
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
