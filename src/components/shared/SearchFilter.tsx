"use client";

import { Search, X } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (val: string) => void;
  }[];
  extra?: ReactNode;
}

export default function SearchFilter({
  placeholder = "Cari…",
  value,
  onChange,
  filters = [],
  extra,
}: SearchFilterProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20,
      }}
    >
      {/* Search input */}
      <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: focused ? "var(--primary)" : "var(--text-muted)",
            transition: "color 0.2s",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 38,
            paddingLeft: 36,
            paddingRight: value ? 36 : 14,
            borderRadius: 14,
            border: `1.5px solid ${focused ? "var(--primary)" : "var(--border)"}`,
            background: "var(--card)",
            color: "var(--text)",
            fontSize: 13.5,
            fontWeight: 500,
            fontFamily: "inherit",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              display: "flex",
              color: "var(--text-muted)",
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Select filters */}
      {filters.map((f) => (
        <select
          key={f.key}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          style={{
            height: 38,
            padding: "0 12px",
            borderRadius: 14,
            border: "1.5px solid var(--border)",
            background: "var(--card)",
            color: f.value ? "var(--text)" : "var(--text-muted)",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            outline: "none",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
          onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {/* Extra slot (e.g. add button) */}
      {extra}
    </div>
  );
}
