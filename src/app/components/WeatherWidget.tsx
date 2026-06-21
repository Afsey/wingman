'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, Moon, CloudRain, CloudSnow, CloudLightning, CloudFog, Loader2 } from 'lucide-react';

export default function WeatherWidget() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    icon: any;
    isDay: boolean;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    const fetchWeather = async () => {
      try {
        // Trivandrum coordinates
        const lat = 8.5241;
        const lon = 76.9366;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        
        if (data.current_weather) {
          const { temperature, weathercode, is_day } = data.current_weather;
          
          let condition = 'Clear';
          let IconComponent = is_day ? Sun : Moon;
          
          if (weathercode === 0) {
            condition = 'Clear Sky';
          } else if (weathercode >= 1 && weathercode <= 3) {
            condition = weathercode === 1 ? 'Mainly Clear' : weathercode === 2 ? 'Partly Cloudy' : 'Overcast';
            IconComponent = Cloud;
          } else if (weathercode === 45 || weathercode === 48) {
            condition = 'Foggy';
            IconComponent = CloudFog;
          } else if ((weathercode >= 51 && weathercode <= 67) || (weathercode >= 80 && weathercode <= 82)) {
            condition = 'Rainy';
            IconComponent = CloudRain;
          } else if ((weathercode >= 71 && weathercode <= 77) || weathercode === 85 || weathercode === 86) {
            condition = 'Snowy';
            IconComponent = CloudSnow;
          } else if (weathercode >= 95) {
            condition = 'Thunderstorm';
            IconComponent = CloudLightning;
          }

          setWeather({
            temp: Math.round(temperature),
            condition: condition,
            icon: IconComponent,
            isDay: is_day === 1
          });
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="weather-widget glass-panel">
      <div className="weather-left">
        <div className="weather-location">Trivandrum</div>
        <div className="weather-date">{currentDate}</div>
      </div>
      
      <div className="weather-divider"></div>
      
      <div className="weather-right">
        {weather ? (
          <>
            <div className="weather-temp-group">
              <weather.icon size={24} className="weather-icon" />
              <span className="weather-temp">{weather.temp}°C</span>
            </div>
            <div className="weather-condition">{weather.condition}</div>
          </>
        ) : (
          <div className="weather-temp-group" style={{ height: '100%', alignItems: 'center' }}>
            <Loader2 size={20} className="weather-icon animate-spin" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
