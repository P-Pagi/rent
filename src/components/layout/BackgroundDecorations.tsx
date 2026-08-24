"use client";

import { useEffect, useRef, useState } from "react";

// Bubble config
const BUBBLES = [
  { size: 8,  left: "8%",  delay: 0,    duration: 12, opacity: 0.5 },
  { size: 12, left: "18%", delay: 2,    duration: 15, opacity: 0.4 },
  { size: 6,  left: "28%", delay: 4,    duration: 11, opacity: 0.6 },
  { size: 16, left: "38%", delay: 1.5,  duration: 18, opacity: 0.3 },
  { size: 9,  left: "52%", delay: 3,    duration: 14, opacity: 0.5 },
  { size: 14, left: "63%", delay: 0.5,  duration: 16, opacity: 0.4 },
  { size: 7,  left: "75%", delay: 5,    duration: 13, opacity: 0.55 },
  { size: 11, left: "84%", delay: 2.5,  duration: 17, opacity: 0.35 },
  { size: 5,  left: "92%", delay: 1,    duration: 10, opacity: 0.6 },
];

// SVG jellyfish — minimal kawaii style
function JellyfishSVG({ color = "#C4B5FD", size = 80 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 80 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bell */}
      <ellipse cx="40" cy="34" rx="30" ry="28" fill={color} fillOpacity="0.30" />
      <ellipse cx="40" cy="34" rx="30" ry="28" stroke={color} strokeWidth="1.5" strokeOpacity="0.50" fill="none" />
      {/* Inner shine */}
      <ellipse cx="32" cy="24" rx="10" ry="7" fill="white" fillOpacity="0.18" />
      {/* Eyes */}
      <circle cx="34" cy="36" r="3" fill={color} fillOpacity="0.80" />
      <circle cx="46" cy="36" r="3" fill={color} fillOpacity="0.80" />
      <circle cx="35" cy="35" r="1" fill="white" />
      <circle cx="47" cy="35" r="1" fill="white" />
      {/* Smile */}
      <path d="M35 41 Q40 45 45 41" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.70" fill="none" />
      {/* Cheeks */}
      <ellipse cx="30" cy="40" rx="4" ry="2.5" fill="#F9A8D4" fillOpacity="0.40" />
      <ellipse cx="50" cy="40" rx="4" ry="2.5" fill="#F9A8D4" fillOpacity="0.40" />
      {/* Tentacles */}
      {[22, 28, 34, 40, 46, 52, 58].map((x, i) => (
        <path
          key={i}
          d={`M${x} 60 Q${x + (i % 2 === 0 ? 5 : -5)} ${75 + (i % 3) * 6} ${x + (i % 2 === 0 ? 2 : -2)} ${90 + (i % 2) * 10}`}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.45"
          fill="none"
        />
      ))}
    </svg>
  );
}

// SVG tiny fish
function FishSVG({ color = "#BEE3F8", size = 36 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="18" rx="20" ry="12" fill={color} fillOpacity="0.40" />
      <path d="M12 18 L0 8 L0 28 Z" fill={color} fillOpacity="0.35" />
      <circle cx="44" cy="16" r="3" fill="white" fillOpacity="0.70" />
      <circle cx="44" cy="16" r="1.5" fill={color} fillOpacity="0.80" />
    </svg>
  );
}

// SVG tiny star
function StarSVG({ color = "#FCD34D", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5Z"
        fill={color}
        fillOpacity="0.50"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.60"
      />
    </svg>
  );
}

export default function BackgroundDecorations() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated rising bubbles via canvas
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Bubble = { x: number; y: number; r: number; speed: number; opacity: number; wobble: number; wobbleSpeed: number; tick: number };
    const bubbles: Bubble[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      r: 3 + Math.random() * 8,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.08 + Math.random() * 0.14,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.015,
      tick: 0,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.tick += b.wobbleSpeed;
        const wx = Math.sin(b.tick + b.wobble) * 1.5;

        // Reset when off-screen
        if (b.y + b.r < 0) {
          b.y = canvas.height + b.r;
          b.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(b.x + wx, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139,92,246,${b.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tiny shine
        ctx.beginPath();
        ctx.arc(b.x + wx - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 1.5})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div suppressHydrationWarning>
      {/* Rising bubbles canvas — low opacity, purely decorative */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0, opacity: 0.6 }}
      />

      {/* ── Corner Decorations ─────────────────────────────────────── */}

      {/* Top-left – large ocean blue jellyfish (matching primary artwork) */}
      <div
        className="fixed pointer-events-none select-none animate-float-jellyfish"
        style={{ top: -10, left: -10, zIndex: 0, opacity: 0.65 }}
      >
        <JellyfishSVG color="#60A5FA" size={115} />
      </div>

      {/* Top-right – soft sky blue jellyfish */}
      <div
        className="fixed pointer-events-none select-none animate-float-jellyfish delay-700"
        style={{ top: 20, right: -10, zIndex: 0, opacity: 0.50 }}
      >
        <JellyfishSVG color="#38BDF8" size={90} />
      </div>

      {/* Bottom-left – cyan aqua jellyfish */}
      <div
        className="fixed pointer-events-none select-none animate-float-slow delay-1000"
        style={{ bottom: 60, left: -16, zIndex: 0, opacity: 0.45 }}
      >
        <JellyfishSVG color="#93C5FD" size={85} />
      </div>

      {/* Bottom-right – small pink-accent jellyfish (matching image accent) */}
      <div
        className="fixed pointer-events-none select-none animate-float-jellyfish delay-1500"
        style={{ bottom: 40, right: -8, zIndex: 0, opacity: 0.38 }}
      >
        <JellyfishSVG color="#F472B6" size={70} />
      </div>

      {/* Mid-right – tiny fish drifting */}
      <div
        className="fixed pointer-events-none select-none animate-drift-left delay-500"
        style={{ top: "42%", right: 12, zIndex: 0, opacity: 0.40 }}
      >
        <FishSVG color="#93C5FD" size={44} />
      </div>

      {/* Mid-left – another tiny fish */}
      <div
        className="fixed pointer-events-none select-none animate-drift-right delay-1000"
        style={{ top: "65%", left: 14, zIndex: 0, opacity: 0.35 }}
      >
        <FishSVG color="#38BDF8" size={36} />
      </div>

      {/* Stars scattered */}
      <div className="fixed pointer-events-none select-none animate-float-bubble delay-300"
        style={{ top: "30%", right: 40, zIndex: 0, opacity: 0.45 }}>
        <StarSVG color="#FCD34D" size={16} />
      </div>
      <div className="fixed pointer-events-none select-none animate-float-bubble delay-1000"
        style={{ top: "55%", left: 36, zIndex: 0, opacity: 0.40 }}>
        <StarSVG color="#38BDF8" size={12} />
      </div>
      <div className="fixed pointer-events-none select-none animate-float-slow delay-2000"
        style={{ bottom: "25%", right: 60, zIndex: 0, opacity: 0.35 }}>
        <StarSVG color="#60A5FA" size={14} />
      </div>

      {/* Static floating bubble clusters */}
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            width:  b.size,
            height: b.size,
            left:   b.left,
            bottom: `${10 + (i * 7) % 40}%`,
            border: "1px solid rgba(56,189,248,0.30)",
            backgroundColor: "rgba(224,242,254,0.12)",
            animationName: "float-bubble",
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            opacity: b.opacity,
            zIndex: 0,
          }}
        />
      ))}
    </div>
  );
}
