"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import BackgroundDecorations from "@/components/layout/BackgroundDecorations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password harus diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Username atau password salah 🪼");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
      }}
    >
      {/* Background Decor */}
      <BackgroundDecorations />

      {/* Login Box */}
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 24,
          padding: "40px 32px",
          boxShadow: "var(--shadow-lg)",
          zIndex: 10,
          animation: "scale-in 0.4s ease-out",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <img
            src="/image/logo.png"
            alt="noyrent.cos Logo"
            style={{
              width: 64,
              height: 64,
              objectFit: "contain",
            }}
          />
          <div>
            <h1
              className="gradient-text-ocean"
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Noy.Rentcos
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0", fontWeight: 600 }}>
              Cosplay Admin Dashboard Login
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "rgba(252,165,165,0.18)",
              border: "1px solid var(--danger)",
              color: "#DC2626",
              borderRadius: 14,
              padding: "10px 16px",
              fontSize: 12.5,
              fontWeight: 700,
              textAlign: "center",
              animation: "shake 0.3s ease",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Username Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-soft)",
                }}
              />
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  height: 44,
                  paddingLeft: 42,
                  paddingRight: 14,
                  borderRadius: 14,
                  border: "1.5px solid var(--border)",
                  background: "var(--bg-soft)",
                  color: "var(--text)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(236,72,153,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-soft)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: 44,
                  paddingLeft: 42,
                  paddingRight: 42,
                  borderRadius: 14,
                  border: "1.5px solid var(--border)",
                  background: "var(--bg-soft)",
                  color: "var(--text)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(236,72,153,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              height: 44,
              fontSize: 14,
              fontWeight: 700,
              marginTop: 10,
              gap: 8,
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        {/* Footer Hint */}
        <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600 }}>
          Hint: admin / password
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={""}>
      <LoginForm />
    </Suspense>
  );
}
