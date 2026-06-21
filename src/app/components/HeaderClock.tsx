'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import './HeaderClock.css';

interface HeaderClockProps {
  timezone?: string;
}

export default function HeaderClock({ timezone }: HeaderClockProps) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="header-clock-skeleton"></div>;
  }

  const timeString = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  const dayString = time.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: timezone,
  });

  const dateString = time.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  });

  return (
    <div className="header-clock-container">
      <Clock size={18} className="header-clock-icon" />
      <span className="header-time">{timeString}</span>
      <div className="header-clock-divider"></div>
      <div className="header-date-wrapper">
        <span className="header-day">{dayString}</span>
        <span className="header-date">{dateString}</span>
      </div>
    </div>
  );
}
