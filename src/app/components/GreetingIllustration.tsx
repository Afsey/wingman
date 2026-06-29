'use client';

import React, { useEffect, useState } from 'react';

interface GreetingIllustrationProps {
  greeting: string;
}

const GreetingIllustration = ({ greeting }: GreetingIllustrationProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: '120px' }}></div>; // placeholder to prevent layout shifts
  }

  // Determine illustration based on greeting type
  const isNight = greeting.toLowerCase().includes('night');
  const isAfternoon = greeting.toLowerCase().includes('afternoon');

  if (isNight) {
    // Crescent Moon with Clouds and Twinkling Stars
    return (
      <div className="greeting-illustration-container">
        <svg viewBox="0 0 120 120" width="130" height="130" className="greeting-svg">
          <defs>
            {/* Soft purple-indigo glow */}
            <filter id="moon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="cloud-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(30, 32, 50, 0.8)" />
              <stop offset="100%" stopColor="rgba(15, 16, 26, 0.9)" />
            </linearGradient>
            <linearGradient id="cloud-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(45, 48, 75, 0.7)" />
              <stop offset="100%" stopColor="rgba(20, 21, 35, 0.8)" />
            </linearGradient>
          </defs>

          {/* Twinkling Stars */}
          <circle cx="20" cy="35" r="1" fill="#fff" className="twinkle-star-slow" />
          <circle cx="95" cy="45" r="1.2" fill="#fff" className="twinkle-star-fast" />
          <circle cx="105" cy="25" r="0.8" fill="#fff" className="twinkle-star-slow" />
          <polygon points="55,15 56,17 58,17 56,18 57,20 55,19 53,20 54,18 52,17 54,17" fill="#e0e7ff" className="twinkle-star-medium" />
          <polygon points="15,60 16,61 17.5,61 16.5,62 17,63.5 15.5,62.5 14,63.5 14.5,62 13.5,61 15,61" fill="#e0e7ff" className="twinkle-star-slow" />

          {/* Glowing Crescent Moon */}
          <path
            d="M 60,25 
               A 25,25 0 1, 0 85,50 
               A 20,20 0 1, 1 60,25 Z"
            fill="url(#moon-grad)"
            filter="url(#moon-glow)"
            className="floating-moon"
          />

          {/* Overlapping Cloud 2 (Back) */}
          <path
            d="M 35,80 
               a 12,12 0 0, 1 20,-5 
               a 16,16 0 0, 1 28,2 
               a 10,10 0 0, 1 10,10 
               l -68,0 z"
            fill="url(#cloud-grad-2)"
            opacity="0.65"
            transform="translate(10, 5)"
          />

          {/* Overlapping Cloud 1 (Front) */}
          <path
            d="M 25,85 
               a 14,14 0 0, 1 24,-6 
               a 20,20 0 0, 1 34,2 
               a 12,12 0 0, 1 12,12 
               l -82,0 z"
            fill="url(#cloud-grad-1)"
            transform="translate(2, 2)"
          />
        </svg>
      </div>
    );
  } else if (isAfternoon) {
    // Bright glowing Sun with rotating rays
    return (
      <div className="greeting-illustration-container">
        <svg viewBox="0 0 120 120" width="130" height="130" className="greeting-svg">
          <defs>
            <filter id="sun-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="sun-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Glowing Sun Center */}
          <circle
            cx="60"
            cy="60"
            r="20"
            fill="url(#sun-grad)"
            filter="url(#sun-glow)"
            className="pulsing-sun"
          />

          {/* Rotating Sun Rays */}
          <g transform="translate(60, 60)" className="rotating-rays" stroke="url(#sun-grad)" strokeWidth="3" strokeLinecap="round">
            <line x1="0" y1="-28" x2="0" y2="-36" />
            <line x1="0" y1="28" x2="0" y2="36" />
            <line x1="-28" y1="0" x2="-36" y2="0" />
            <line x1="28" y1="0" x2="36" y2="0" />
            
            <line x1="-20" y1="-20" x2="-25" y2="-25" />
            <line x1="20" y1="20" x2="25" y2="25" />
            <line x1="-20" y1="20" x2="-25" y2="25" />
            <line x1="20" y1="-20" x2="25" y2="-25" />
          </g>
        </svg>
      </div>
    );
    // Good Morning / Evening: Sunset/Sunrise Landscape
    return (
      <>
        <div style={{ height: '120px' }}></div>
        <div className="greeting-illustration-container" style={{ position: 'absolute', top: '-120px', left: '-10%', width: '140%', minWidth: '600px', zIndex: -1, pointerEvents: 'none', opacity: 0.9 }}>
          <svg viewBox="0 0 350 180" width="100%" height="auto" className="greeting-svg" style={{ overflow: 'visible' }}>
          <defs>
            {/* Sun Glow Filter */}
            <filter id="landscape-sun-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Sun Gradient */}
            <linearGradient id="landscape-sun-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Mountain Gradients */}
            <linearGradient id="mountain-back" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            
            <linearGradient id="mountain-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Cloud Gradient */}
            <linearGradient id="landscape-cloud" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(30, 27, 75, 0.6)" />
              <stop offset="100%" stopColor="rgba(2, 6, 23, 0.9)" />
            </linearGradient>
            
            {/* Water Reflection Gradient */}
            <linearGradient id="water-reflect" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.6)" />
              <stop offset="100%" stopColor="rgba(234, 88, 12, 0)" />
            </linearGradient>
          </defs>

          {/* Starry Sky Background Elements */}
          <circle cx="40" cy="30" r="1" fill="#fff" opacity="0.6" className="twinkle-star-slow" />
          <circle cx="120" cy="20" r="1.5" fill="#fff" opacity="0.8" className="twinkle-star-fast" />
          <circle cx="250" cy="40" r="1" fill="#fff" opacity="0.5" className="twinkle-star-slow" />
          <circle cx="310" cy="15" r="1.2" fill="#fff" opacity="0.7" className="twinkle-star-medium" />
          
          {/* Distant Clouds */}
          <path d="M 60,60 a 10,10 0 0,1 15,-5 a 15,15 0 0,1 25,2 a 8,8 0 0,1 8,8 l -48,0 z" fill="url(#landscape-cloud)" />
          <path d="M 220,50 a 12,12 0 0,1 18,-6 a 20,20 0 0,1 32,4 a 10,10 0 0,1 10,10 l -60,0 z" fill="url(#landscape-cloud)" opacity="0.8" />

          {/* Massive Glowing Sun */}
          <circle
            cx="100"
            cy="90"
            r="40"
            fill="url(#landscape-sun-grad)"
            filter="url(#landscape-sun-glow)"
          />

          {/* Background Mountains (Right) */}
          <path
            d="M 120,110 Q 200,80 280,100 T 400,120 L 400,180 L 120,180 Z"
            fill="url(#mountain-back)"
          />
          
          {/* Background Mountains (Left) */}
          <path
            d="M -20,130 Q 60,90 140,115 T 260,130 L 260,180 L -20,180 Z"
            fill="url(#mountain-back)"
          />

          {/* Water reflection of the sun */}
          <g transform="translate(100, 120)">
            <rect x="-35" y="0" width="70" height="3" fill="url(#water-reflect)" rx="1.5" opacity="0.9" />
            <rect x="-28" y="6" width="56" height="3" fill="url(#water-reflect)" rx="1.5" opacity="0.7" />
            <rect x="-20" y="12" width="40" height="2" fill="url(#water-reflect)" rx="1" opacity="0.5" />
            <rect x="-10" y="17" width="20" height="2" fill="url(#water-reflect)" rx="1" opacity="0.3" />
            <rect x="-4" y="21" width="8" height="1.5" fill="url(#water-reflect)" rx="0.5" opacity="0.1" />
          </g>

          {/* Foreground Mountains / Land */}
          <path
            d="M -20,180 Q 80,115 160,140 T 360,125 L 360,180 Z"
            fill="url(#mountain-front)"
          />
        </svg>
      </div>
      </>
    );
  }
};

export default React.memo(GreetingIllustration);
