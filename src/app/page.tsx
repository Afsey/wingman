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
import dynamic from 'next/dynamic';
import GreetingIllustration from './components/GreetingIllustration';
import AnalogClock from './components/AnalogClock';
import WeatherWidget from './components/WeatherWidget';
import WorldClockList from './components/WorldClockList';

const LoginModal = dynamic(() => import('./components/LoginModal'), { ssr: false });
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

const MORNING_QUOTES = [
  "A fresh start. Let's make today count.",
  "Rise and shine. Time to build.",
  "New day, new opportunities.",
  "The morning sets the tone for the day.",
  "Seize the day and embrace the challenges.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Every morning is a blank canvas.",
  "Let today be the day you take a step forward.",
  "Your goals are waiting. Let's get to work.",
  "Breathe in the new day. Exhale yesterday.",
  "Sun's up, time to level up.",
  "A focused morning leads to a productive day.",
  "Today is full of endless possibilities.",
  "Start strong, stay consistent."
];

const AFTERNOON_QUOTES = [
  "Halfway there. Keep the momentum going.",
  "Stay sharp. The day isn't over yet.",
  "Fuel your focus and power through.",
  "Afternoon push! Let's finish what we started.",
  "Keep up the good work. You're doing great.",
  "Don't stop now, you're on a roll.",
  "Maintain your rhythm. The finish line is near.",
  "Recharge and tackle the rest of the day.",
  "A steady pace wins the race.",
  "Stay resilient, keep pushing forward.",
  "Focus on progress, not perfection.",
  "You're halfway through. Make it count.",
  "Keep your eyes on the prize.",
  "Harness your afternoon energy."
];

const EVENING_QUOTES = [
  "Winding down. Reflect on today's wins.",
  "The day is done. Time to relax and reflect.",
  "Evening calm. Prepare for tomorrow.",
  "A good day's work deserves a restful evening.",
  "Take a moment to appreciate your progress today.",
  "Unwind and let go of the day's stress.",
  "Celebrate the small victories of today.",
  "Transition from doing to being.",
  "Clear your mind, find your peace.",
  "Reflect on what you learned today.",
  "The evening brings closure and calm.",
  "Rest up. Tomorrow is a new adventure.",
  "Leave today's worries behind you.",
  "Embrace the quiet of the evening."
];

const NIGHT_QUOTES = [
  "Another day completed. Rest and recharge.",
  "Time to power down. Sleep well.",
  "The stars are out. Time for deep rest.",
  "A quiet night for a clear tomorrow.",
  "Let your body and mind rejuvenate.",
  "Sleep is the best meditation.",
  "Close your eyes and dream big.",
  "Rest is productive. Embrace it.",
  "Tomorrow needs your energy. Sleep now.",
  "Let the silence of the night soothe you.",
  "Drift into restful sleep.",
  "A peaceful night leads to a powerful morning.",
  "Recharge your batteries for a new dawn.",
  "The night is for resting and dreaming."
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

  // (Time state and interval have been moved to WorldClockList for performance)

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

    const epochDays = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const dayIndex = epochDays % 14;

    if (hours >= 5 && hours < 12) {
      setGreeting('Good Morning');
      setSubGreeting(MORNING_QUOTES[dayIndex]);
    } else if (hours >= 12 && hours < 17) {
      setGreeting('Good Afternoon');
      setSubGreeting(AFTERNOON_QUOTES[dayIndex]);
    } else if (hours >= 17 && hours < 22) {
      setGreeting('Good Evening');
      setSubGreeting(EVENING_QUOTES[dayIndex]);
    } else {
      setGreeting('Good Night');
      setSubGreeting(NIGHT_QUOTES[dayIndex]);
    }
  };

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
      // Manually pick a random quote to override the daily one
      const randomIndex = Math.floor(Math.random() * 25); // Currently 25 quotes in lib
      import('@/lib/quotes').then(module => {
        setQuote(module.MOTIVATIONAL_QUOTES[randomIndex]);
        setIsQuoteRefreshing(false);
      });
    }, 600);
  };

  // Clock time helpers removed from here, now encapsulated in WorldClockList

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
          <WorldClockList 
            worldClocks={worldClocks} 
            handleRemoveClock={handleRemoveClock} 
            setShowAddClockModal={setShowAddClockModal} 
          />

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
