'use client';

import { useEffect, useState } from 'react';

interface AnalogClockProps {
  timezone: string;
}

export default function AnalogClock({ timezone }: AnalogClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="analog-clock-container">
        <div className="analog-clock-face">
          <div className="clock-center-pin"></div>
        </div>
      </div>
    );
  }

  // Extract hours, minutes, and seconds in the target timezone
  let localHours = 0;
  let localMinutes = 0;
  let localSeconds = 0;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(time);
    const hPart = parts.find((p) => p.type === 'hour');
    const mPart = parts.find((p) => p.type === 'minute');
    const sPart = parts.find((p) => p.type === 'second');

    if (hPart) localHours = parseInt(hPart.value, 10);
    if (mPart) localMinutes = parseInt(mPart.value, 10);
    if (sPart) localSeconds = parseInt(sPart.value, 10);
  } catch (e) {
    // fallback
    localHours = time.getHours();
    localMinutes = time.getMinutes();
    localSeconds = time.getSeconds();
  }

  // Degrees of rotation
  const secondDeg = localSeconds * 6; // 360 / 60
  const minuteDeg = localMinutes * 6 + localSeconds * 0.1; // 360 / 60 + second progress
  const hourDeg = (localHours % 12) * 30 + localMinutes * 0.5; // 360 / 12 + minute progress

  return (
    <div className="analog-clock-container">
      <div className="analog-clock-face">
        {/* Core numbers */}
        <span className="clock-number num-12">12</span>
        <span className="clock-number num-3">3</span>
        <span className="clock-number num-6">6</span>
        <span className="clock-number num-9">9</span>

        {/* Small hour dots for positions 1, 2, 4, 5, 7, 8, 10, 11 */}
        <div className="clock-dot dot-1"></div>
        <div className="clock-dot dot-2"></div>
        <div className="clock-dot dot-4"></div>
        <div className="clock-dot dot-5"></div>
        <div className="clock-dot dot-7"></div>
        <div className="clock-dot dot-8"></div>
        <div className="clock-dot dot-10"></div>
        <div className="clock-dot dot-11"></div>

        {/* Hands */}
        <div className="clock-hand hour-hand" style={{ transform: `rotate(${hourDeg}deg)` }}></div>
        <div className="clock-hand minute-hand" style={{ transform: `rotate(${minuteDeg}deg)` }}></div>
        <div className="clock-hand second-hand" style={{ transform: `rotate(${secondDeg}deg)` }}></div>

        {/* Center pin */}
        <div className="clock-center-pin"></div>
      </div>
    </div>
  );
}
