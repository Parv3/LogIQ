import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, Zap, Gauge } from 'lucide-react';

export default function LiveTelemetryWidget() {
  const [isLive, setIsLive] = useState(true);
  const [tempData, setTempData] = useState([75, 76, 75, 78, 80, 82, 85, 88, 92, 95, 98, 96, 94, 91, 89]);
  const [vibeData, setVibeData] = useState([1.8, 1.9, 1.8, 2.1, 2.4, 2.8, 3.2, 3.8, 4.1, 3.9, 3.5, 3.1, 2.8, 2.4, 2.2]);
  const [pressData, setPressData] = useState([2100, 2105, 2095, 2110, 2125, 2140, 2130, 2115, 2090, 2080, 2095, 2110, 2120, 2105, 2100]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTempData(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(70, Math.min(105, Number((last + (Math.random() * 6 - 2.8)).toFixed(1))));
        return [...prev.slice(1), next];
      });

      setVibeData(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(1.0, Math.min(5.5, Number((last + (Math.random() * 0.8 - 0.38)).toFixed(2))));
        return [...prev.slice(1), next];
      });

      setPressData(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(2000, Math.min(2300, Math.round(last + (Math.random() * 20 - 9.5))));
        return [...prev.slice(1), next];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Helper to construct SVG path string from array of numbers
  const renderSparkline = (data, min, max, strokeColor) => {
    const width = 140;
    const height = 36;
    const range = max - min || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 140 36" style={{ width: '100%', maxWidth: '140px', height: '36px', overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Animated Pulsing Dot on Latest Point */}
        {data.length > 0 && (() => {
          const lastVal = data[data.length - 1];
          const cx = width;
          const cy = height - ((lastVal - min) / range) * (height - 6) - 3;
          return (
            <circle cx={cx} cy={cy} r="3" fill={strokeColor} />
          );
        })()}
      </svg>
    );
  };

  const latestTemp = tempData[tempData.length - 1];
  const latestVibe = vibeData[vibeData.length - 1];
  const latestPress = pressData[pressData.length - 1];

  return (
    <div className="industrial-card">
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="var(--accent-blue)" />
          <span>REAL-TIME SENSOR TELEMETRY & SPARK LINES</span>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className="btn btn-secondary no-print"
          style={{
            fontSize: '0.7rem',
            padding: '0.25rem 0.55rem',
            background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card-sub)',
            borderColor: isLive ? '#10B981' : 'var(--border-color)',
            color: isLive ? '#34D399' : 'var(--text-secondary)'
          }}
        >
          {isLive ? <Pause size={12} color="#34D399" /> : <Play size={12} />}
          <span>{isLive ? 'LIVE STREAMING' : 'PAUSED'}</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {/* Metric 1: Gearbox Oil Temp */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: `1px solid ${latestTemp > 90 ? '#DC2626' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Gearbox Oil Temp
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: latestTemp > 90 ? '#EF4444' : 'var(--text-primary)'
            }}>
              {latestTemp}°C
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            {renderSparkline(tempData, 65, 110, latestTemp > 90 ? '#EF4444' : '#0284C7')}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {latestTemp > 90 ? '⚠️ SPIKE' : 'NORM'}
            </span>
          </div>
        </div>

        {/* Metric 2: Bearing Vibration */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: `1px solid ${latestVibe > 3.5 ? '#D97706' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Bearing Vibration
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: latestVibe > 3.5 ? '#F59E0B' : 'var(--text-primary)'
            }}>
              {latestVibe} mm/s
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            {renderSparkline(vibeData, 1.0, 6.0, latestVibe > 3.5 ? '#F59E0B' : '#10B981')}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {latestVibe > 3.5 ? '⚡ HIGH' : 'STABLE'}
            </span>
          </div>
        </div>

        {/* Metric 3: Hydraulic Pressure */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Hydraulic Pressure
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)'
            }}>
              {latestPress} PSI
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            {renderSparkline(pressData, 1950, 2350, '#3B82F6')}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              NOMINAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
