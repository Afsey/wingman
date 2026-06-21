'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'default', name: 'System Default', icon: Monitor },
  { id: 'dark', name: 'Dark Theme', icon: Moon },
  { id: 'white', name: 'White Theme', icon: Sun },
];

const COLOR_PRESETS = [
  { id: 'blue', name: 'Electric Blue', primary: '#3b82f6' },
  { id: 'red', name: 'Crimson Red', primary: '#ef4444' },
  { id: 'yellow', name: 'Amber Gold', primary: '#eab308' },
  { id: 'green', name: 'Mint Green', primary: '#10b981' },
  { id: 'orange', name: 'Sunset Orange', primary: '#f97316' },
  { id: 'navy-blue', name: 'Royal Navy', primary: '#38bdf8' },
  { id: 'violet', name: 'Neon Violet', primary: '#c084fc' },
  { id: 'rose', name: 'Deep Rose', primary: '#fb7185' },
  { id: 'golden', name: 'Luxury Gold', primary: '#dfb15b' },
  { id: 'maroon', name: 'Burgundy Maroon', primary: '#be1848' },
  { id: 'funky', name: 'Cyber Funky', primary: '#00ffff' },
  { id: 'black-blue', name: 'Black & Blue', primary: '#3b82f6' },
  { id: 'black-yellow', name: 'Black & Yellow', primary: '#eab308' },
  { id: 'black-green', name: 'Black & Green', primary: '#16a34a' },
  { id: 'black-rose', name: 'Black & Rose', primary: '#db2777' },
  { id: 'black-crimson', name: 'Black & Crimson', primary: '#dc2626' },
  { id: 'black-mint', name: 'Black & Mint', primary: '#10b981' },
  { id: 'black-cyan', name: 'Black & Cyan', primary: '#06b6d4' },
  { id: 'black-gold', name: 'Black & Gold', primary: '#f59e0b' },
  { id: 'black-lavender', name: 'Black & Lavender', primary: '#a78bfa' },
  { id: 'white-blue', name: 'White & Blue', primary: '#2563eb' },
  { id: 'white-violet', name: 'White & Violet', primary: '#7e22ce' },
  { id: 'white-orange', name: 'White & Orange', primary: '#ea580c' },
];

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('wingman_theme') || 'default';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('wingman_theme', themeId);
    setShowThemeMenu(false);
  };

  return (
    <div className="theme-selector-container" ref={themeMenuRef}>
      <button 
        onClick={() => setShowThemeMenu(!showThemeMenu)}
        className="theme-select-btn"
      >
        <Sun size={16} style={{ color: 'var(--accent-color)' }} />
      </button>

      {showThemeMenu && (
        <div className="theme-dropdown-menu glass-panel">
          <div className="theme-menu-section-title">Default Options</div>
          <div style={{ marginBottom: '1.25rem' }}>
            {THEME_OPTIONS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`theme-option-btn ${currentTheme === t.id ? 'active' : ''}`}
                >
                  <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
                  {t.name}
                </button>
              );
            })}
          </div>

          <div className="theme-menu-section-title">Aesthetic Colors</div>
          <div className="color-presets-grid">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.id}
                onClick={() => handleThemeChange(color.id)}
                className={`color-preset-btn ${currentTheme === color.id ? 'active' : ''}`}
              >
                <span 
                  className="color-dot" 
                  style={{ backgroundColor: color.primary }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
