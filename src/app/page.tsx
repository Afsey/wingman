'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock as ClockIcon, 
  Plus, 
  RotateCw, 
  Sun, 
  Moon, 
  Monitor, 
  LogIn, 
  Compass, 
  User, 
  Trash2,
  Globe,
  Quote
} from 'lucide-react';
import LoginModal from './components/LoginModal';
import GreetingIllustration from './components/GreetingIllustration';
import AnalogClock from './components/AnalogClock';
import WeatherWidget from './components/WeatherWidget';
import { getQuoteForTime, Quote as QuoteType } from '@/lib/quotes';

// Timezone mapping for world clocks
interface WorldClock {
  id: string;
  city: string;
  timezone: string;
  label: string;
}

const AVAILABLE_TIMEZONES = [
  { city: 'New York', timezone: 'America/New_York', label: 'EST/EDT' },
  { city: 'London', timezone: 'Europe/London', label: 'BST/GMT' },
  { city: 'Dubai', timezone: 'Asia/Dubai', label: 'GST' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', label: 'JST' },
  { city: 'Sydney', timezone: 'Australia/Sydney', label: 'AEST/AEDT' },
  { city: 'Singapore', timezone: 'Asia/Singapore', label: 'SGT' },
  { city: 'Paris', timezone: 'Europe/Paris', label: 'CET/CEST' },
  { city: 'Los Angeles', timezone: 'America/Los_Angeles', label: 'PST/PDT' },
  { city: 'Chicago', timezone: 'America/Chicago', label: 'CST/CDT' },
  { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', label: 'HKT' },
  { city: 'Cairo', timezone: 'Africa/Cairo', label: 'EET' },
  { city: 'Moscow', timezone: 'Europe/Moscow', label: 'MSK' },
  { city: 'Zurich', timezone: 'Europe/Zurich', label: 'CET/CEST' },
  { city: 'Cape Town', timezone: 'Africa/Johannesburg', label: 'SAST' },
  { city: 'Seoul', timezone: 'Asia/Seoul', label: 'KST' }
];

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

export default function LandingPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome');
  const [subGreeting, setSubGreeting] = useState('Another day completed. Rest and recharge.');
  const [userName, setUserName] = useState('Buddy');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  
  // Mounted state to fix client-server hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Theme dropdown state
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Time state
  const [time, setTime] = useState(new Date());

  // Motivation Quote state
  const [quote, setQuote] = useState<QuoteType>({ text: '', author: '' });
  const [isQuoteRefreshing, setIsQuoteRefreshing] = useState(false);

  // Custom World Clocks state
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([
    { id: 'default-in', city: 'India', timezone: 'Asia/Kolkata', label: 'IST' },
    { id: 'default-uae', city: 'UAE', timezone: 'Asia/Dubai', label: 'GST' },
    { id: 'default-uk', city: 'UK', timezone: 'Europe/London', label: 'BST/GMT' }
  ]);
  const [showAddClockModal, setShowAddClockModal] = useState(false);

  // Login Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Calculate Greeting in Indian Standard Time (IST)
  const updateISTGreeting = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (3600000 * 5.5));
    const hours = istTime.getHours();

    if (hours >= 5 && hours < 12) {
      setGreeting('Good Morning');
      setSubGreeting("A fresh start. Let's make today count.");
    } else if (hours >= 12 && hours < 17) {
      setGreeting('Good Afternoon');
      setSubGreeting("Halfway there. Keep the momentum going.");
    } else if (hours >= 17 && hours < 22) {
      setGreeting('Good Evening');
      setSubGreeting("Winding down. Reflect on today's wins.");
    } else {
      setGreeting('Good Night');
      setSubGreeting("Another day completed. Rest and recharge.");
    }
  };

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialization: check local storage and load service worker
  useEffect(() => {
    setMounted(true);
    updateISTGreeting();
    
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const sessionStr = document.cookie
          .split('; ')
          .find(row => row.startsWith('wingman_session='));
        if (sessionStr) {
          const sessionVal = decodeURIComponent(sessionStr.split('=')[1]);
          const session = JSON.parse(sessionVal);
          setUserName(session.name);
          setIsLoggedIn(true);
        }
      } catch (e) {}
    };
    checkSession();

    // Load theme
    const savedTheme = localStorage.getItem('wingman_theme') || 'default';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load custom clocks if saved
    const savedClocks = localStorage.getItem('wingman_custom_clocks');
    if (savedClocks) {
      try {
        setWorldClocks(JSON.parse(savedClocks));
      } catch (e) {}
    }

    // Load quote
    setQuote(getQuoteForTime());

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.error('ServiceWorker registration failed:', err);
        });
    }

    // Handle close click outside theme menu
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme changing handler
  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('wingman_theme', themeId);
    setShowThemeMenu(false);
  };

  // Manual Quote Refresh Handler
  const handleRefreshQuote = () => {
    setIsQuoteRefreshing(true);
    setTimeout(() => {
      localStorage.removeItem('wingman_cached_quote');
      localStorage.removeItem('wingman_cached_quote_time');
      setQuote(getQuoteForTime());
      setIsQuoteRefreshing(false);
    }, 600);
  };

  // Clock time helper
  const formatTimeForZone = (timezone: string) => {
    if (!mounted) return '--:--:--';
    try {
      return time.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return '--:--:--';
    }
  };

  // Clock date helper
  const formatDateForZone = (timezone: string) => {
    if (!mounted) return '---';
    try {
      const month = time.toLocaleString('en-US', { timeZone: timezone, month: 'long' });
      const day = time.toLocaleString('en-US', { timeZone: timezone, day: 'numeric' });
      const weekday = time.toLocaleString('en-US', { timeZone: timezone, weekday: 'short' });
      return `${month} ${day} , ${weekday}`;
    } catch (e) {
      return '---';
    }
  };

  // Add Custom Clock
  const handleAddClock = (timezoneObj: typeof AVAILABLE_TIMEZONES[0]) => {
    if (worldClocks.length >= 5) {
      alert('You can display a maximum of 5 world clocks.');
      return;
    }
    const exists = worldClocks.some(c => c.timezone === timezoneObj.timezone);
    if (exists) {
      alert('This timezone is already displayed.');
      return;
    }
    const newClock: WorldClock = {
      id: crypto.randomUUID(),
      city: timezoneObj.city,
      timezone: timezoneObj.timezone,
      label: timezoneObj.label
    };
    const updatedClocks = [...worldClocks, newClock];
    setWorldClocks(updatedClocks);
    localStorage.setItem('wingman_custom_clocks', JSON.stringify(updatedClocks));
    setShowAddClockModal(false);
  };

  // Remove Custom Clock
  const handleRemoveClock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedClocks = worldClocks.filter(c => c.id !== id);
    setWorldClocks(updatedClocks);
    localStorage.setItem('wingman_custom_clocks', JSON.stringify(updatedClocks));
  };

  const handleLoginSuccess = (user: { name: string; email: string; role: string; timezone: string }) => {
    setUserName(user.name);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    localStorage.setItem('wingman_user', JSON.stringify(user));
    router.push('/dashboard');
  };

  const renderGreeting = () => {
    if (!mounted) return <>Welcome back <span className="buddy-highlight">Buddy.</span></>;
    const parts = greeting.split(' ');
    if (parts.length > 1) {
      return (
        <>
          {parts[0]} <span className="greeting-gradient">{parts[1]}.</span>
        </>
      );
    }
    return <>{greeting}.</>;
  };

  return (
    <div className="landing-wrapper">
      
      {/* Header Area */}
      <header className="app-header">
        <div className="brand-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Wingman Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} />
          <span className="brand-name" style={{ fontSize: '1.5rem' }}>WINGMAN</span>
        </div>

        {/* Theme select wrapper */}
        <div className="theme-selector-container" ref={themeMenuRef}>
          <button 
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="theme-select-btn"
          >
            <Sun size={16} style={{ color: 'var(--accent-color)' }} />
            <span>Theme Selection</span>
          </button>

          {/* Theme Dropdown Menu */}
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
      </header>

      {/* Main Side-by-Side Content Layout */}
      {/* Main Side-by-Side Content Layout */}
      <main className="main-content-layout">
        
        {/* Left Column: Greeting, Welcome & Call to Action */}
        <div className="hero-left-col">
          <div className="greeting-illustration-wrapper">
            <GreetingIllustration greeting={mounted ? greeting : 'Welcome'} />
          </div>
          
          <h1 className="hero-greeting">
            {renderGreeting()}
          </h1>
          
          <div className="greeting-glow-line"></div>
          
          <p className="hero-welcome">
            {mounted ? subGreeting : 'Another day completed. Rest and recharge.'}
          </p>
          
          <div className="hero-actions">
            {isLoggedIn ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="btn-primary"
                style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '1rem' }}
              >
                <User size={18} />
                Open Wingman Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="btn-primary login-cta-btn"
              >
                <LogIn size={18} />
                Login to Wingman
              </button>
            )}
          </div>
          
          <div className="weather-widget-wrapper">
            <WeatherWidget />
          </div>
        </div>

        {/* Right Column: World Clocks & Motivation stacked vertically */}
        <div className="hero-right-col">
          
          {/* World Clocks Card */}
          <div className="world-clocks-card glass-panel glow-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon-badge">
                  <Globe style={{ color: 'var(--accent-color)' }} size={16} />
                </div>
                <h3 className="card-title">World Clocks</h3>
              </div>
              
              {worldClocks.length < 5 && (
                <button 
                  onClick={() => setShowAddClockModal(true)}
                  className="btn-add-clock"
                  title="Add Clock"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              )}
            </div>

            {/* Clocks Row (Stacked vertically) */}
            <div className="clocks-grid">
              {worldClocks.map((c) => (
                <div key={c.id} className="clock-item">
                  {/* Delete button (show on any clock except India) */}
                  {c.timezone !== 'Asia/Kolkata' && (
                    <button
                      onClick={(e) => handleRemoveClock(c.id, e)}
                      className="clock-delete-btn"
                      title="Remove Clock"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  
                  {/* Left Half: Analog Clock */}
                  <div className="clock-item-left">
                    <AnalogClock timezone={c.timezone} />
                  </div>
                  
                  {/* Center: Thin divider line */}
                  <div className="clock-item-divider"></div>
                  
                  {/* Right Half: Timezone & Ticking Time */}
                  <div className="clock-item-right">
                    <div className="clock-label">{c.label}</div>
                    <div className="clock-city">{c.city}</div>
                    <div className="clock-time">
                      {formatTimeForZone(c.timezone)}
                    </div>
                    <div className="clock-date">
                      {formatDateForZone(c.timezone)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation Quote Card */}
          <div className="quote-card glass-panel glow-card">
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon-badge">
                  <Quote style={{ color: 'var(--accent-color)' }} size={16} />
                </div>
                <h3 className="card-title">Motivation of the Day</h3>
              </div>
              <button 
                onClick={handleRefreshQuote}
                disabled={isQuoteRefreshing}
                className="btn-refresh-quote"
                title="Refresh Quote"
              >
                <RotateCw size={14} className={isQuoteRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            <blockquote className="quote-blockquote">
              "{quote.text || 'Loading quote...'}"
            </blockquote>

            <cite className="quote-author">
              — {quote.author || 'Unknown'}
            </cite>
          </div>

        </div>

      </main>

      {/* Footer copyright */}
      <footer className="app-footer-grid">
        <div className="footer-left"></div>
        <div className="footer-center">
          PROJECT WINGMAN &copy; {new Date().getFullYear()} &bull; ALL RIGHTS RESERVED
        </div>
        <div className="footer-right"></div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Add Custom Clock Dialog Modal */}
      {showAddClockModal && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel bg-slate-900" style={{ maxWidth: '360px' }}>
            <h3 className="modal-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add World Clock</h3>
            <div className="clock-selector-list">
              {AVAILABLE_TIMEZONES.map((tz) => {
                const alreadyAdded = worldClocks.some(c => c.timezone === tz.timezone);
                return (
                  <button
                    key={tz.timezone}
                    disabled={alreadyAdded}
                    onClick={() => handleAddClock(tz)}
                    className="clock-selector-btn"
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tz.city}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{tz.timezone}</span>
                    </div>
                    <span className="clock-label" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px' }}>
                      {tz.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAddClockModal(false)}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '1rem', display: 'block' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
