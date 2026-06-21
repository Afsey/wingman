'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ThemeSelector from '../components/ThemeSelector';
import { Menu, X, Bell, Sparkles } from 'lucide-react';
import './DashboardLayout.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar automatically on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const pathParts = pathname.split('/').filter(Boolean);
  const currentSegment = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'Overview';
  const breadcrumbText = currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header for Sidebar Toggle */}
      {isMobile && (
        <div className="mobile-top-bar glass-panel">
          <div className="echo-brand">
            <button className="echo-mobile-bubble">
              ECHO
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeSelector />
            <button aria-label="Notifications" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '4px', display: 'flex' }}>
              <Bell size={20} />
            </button>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: '4px' }}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div className={`sidebar-wrapper ${isMobile ? 'mobile-sidebar' : ''} ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div className="dashboard-main-content">
        {!isMobile && <Header />}
        
        {/* Global Breadcrumb */}
        <div style={{ padding: isMobile ? '8px 16px' : '0 16px', marginBottom: '16px' }}>
          <div className="dashboard-breadcrumb">
            <button className="breadcrumb-back-btn" onClick={() => window.history.back()}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </span>
            </button>
            <span style={{ color: 'var(--text-tertiary)', margin: '0 8px' }}>›</span>
            <span className="breadcrumb-current">{breadcrumbText}</span>
          </div>
        </div>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
