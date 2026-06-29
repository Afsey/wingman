'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';
import AnalogClock from './AnalogClock';

interface WorldClock {
  id: string;
  city: string;
  timezone: string;
  label: string;
}

interface WorldClockListProps {
  worldClocks: WorldClock[];
  handleRemoveClock: (id: string, e: React.MouseEvent) => void;
  setShowAddClockModal: (show: boolean) => void;
}

const WorldClockList = ({ worldClocks, handleRemoveClock, setShowAddClockModal }: WorldClockListProps) => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeForZone = (timezone: string) => {
    if (!mounted) return '--:--:--';
    try {
      return time.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return '--:--:--';
    }
  };

  const formatDateForZone = (timezone: string) => {
    if (!mounted) return '--/--/----';
    try {
      const month = time.toLocaleString('en-US', { timeZone: timezone, month: 'long' });
      const day = time.toLocaleString('en-US', { timeZone: timezone, day: 'numeric' });
      const weekday = time.toLocaleString('en-US', { timeZone: timezone, weekday: 'short' });
      return `${weekday}, ${month} ${day}`;
    } catch {
      return '--/--/----';
    }
  };

  return (
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

      <div className="clocks-grid">
        {worldClocks.map((c) => (
          <div key={c.id} className="clock-item">
            {c.timezone !== 'Asia/Kolkata' && (
              <button
                onClick={(e) => handleRemoveClock(c.id, e)}
                className="clock-delete-btn"
                title="Remove Clock"
              >
                <Trash2 size={12} />
              </button>
            )}
            
            <div className="clock-item-left">
              <AnalogClock timezone={c.timezone} />
            </div>
            
            <div className="clock-item-divider"></div>
            
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
  );
};

export default React.memo(WorldClockList);
