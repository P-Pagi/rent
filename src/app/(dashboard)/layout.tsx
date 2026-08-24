"use client";

import { ReactNode, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import BackgroundDecorations from "@/components/layout/BackgroundDecorations";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setMobileSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      {/* Decorative background */}
      <BackgroundDecorations />

      {/* Mobile backdrop overlay — click to close sidebar */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper${mobileSidebarOpen ? " sidebar-mobile-open" : ""}`}>
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main content area */}
      <div
        className="dashboard-main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Navbar onMenuClick={openSidebar} />
        <main className="main-content-area" style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }}>
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
