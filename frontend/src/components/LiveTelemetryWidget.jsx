import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, Zap, Gauge } from 'lucide-react';

export default function LiveTelemetryWidget({ sensorReadings }) {
  const [isLive, setIsLive] = useState(true);

  // Dynamic metric definitions based on incoming sensor readings
  const [metric1, setMetric1] = useState({ name: 'Gearbox Oil Temp', unit: '°C', val: 89, isSpike: false, min: 65, max: 110 });
  const [metric2, setMetric2] = useState({ name: 'Bearing Vibration', unit: 'mm/s', val: 2.2, isSpike: false, min: 1.0, max: 6.0 });
  const [metric3, setMetric3] = useState({ name: 'Hydraulic Pressure', unit: 'PSI', val: 2100, isSpike: false, min: 1950, max: 2350 });

  const [tempData, setTempData] = useState([75, 76, 75, 78, 80, 82, 85, 88, 92, 95, 98, 96, 94, 91, 89]);
  const [vibeData, setVibeData] = useState([1.8, 1.9, 1.8, 2.1, 2.4, 2.8, 3.2, 3.8, 4.1, 3.9, 3.5, 3.1, 2.8, 2.4, 2.2]);
  const [pressData, setPressData] = useState([2100, 2105, 2095, 2110, 2125, 2140, 2130, 2115, 2090, 2080, 2095, 2110, 2120, 2105, 2100]);

  // Synchronize with incoming sensor readings when new shift/CSV is loaded
  useEffect(() => {
    if (!sensorReadings || sensorReadings.length === 0) return;

    // Find temperature reading
    const tempReading = sensorReadings.find(s => s.metric?.toLowerCase().includes('temp')) || sensorReadings[0];
    if (tempReading && !isNaN(tempReading.value)) {
      const v = Number(tempReading.value);
      const isSpike = v > 90;
      setMetric1({
        name: tempReading.metric,
        unit: tempReading.unit || '°C',
        val: v,
        isSpike,
        min: Math.min(60, v - 20),
        max: Math.max(105, v + 15)
      });
      setTempData(Array(14).fill(Number((v * 0.85).toFixed(1))).concat([v]));
    }

    // Find vibration or speed reading
    const vibeReading = sensorReadings.find(s => s.metric?.toLowerCase().includes('vibration') || s.metric?.toLowerCase().includes('speed')) || sensorReadings[1];
    if (vibeReading && !isNaN(vibeReading.value)) {
      const v = Number(vibeReading.value);
      const isSpike = v > 3.5 || v < 500;
      setMetric2({
        name: vibeReading.metric,
        unit: vibeReading.unit || (v > 100 ? 'RPM' : 'mm/s'),
        val: v,
        isSpike,
        min: Math.min(1.0, v * 0.5),
        max: Math.max(6.0, v * 1.5)
      });
      setVibeData(Array(14).fill(Number((v * 0.9).toFixed(2))).concat([v]));
    }

    // Find pressure reading
    const pressReading = sensorReadings.find(s => s.metric?.toLowerCase().includes('pressure') || s.metric?.toLowerCase().includes('current')) || sensorReadings[2];
    if (pressReading && !isNaN(pressReading.value)) {
      const v = Number(pressReading.value);
      const isSpike = v < 1000 && v > 50; // pressure drop
      setMetric3({
        name: pressReading.metric,
        unit: pressReading.unit || (v < 100 ? 'Amps' : 'PSI'),
        val: v,
        isSpike,
        min: Math.min(400, v * 0.8),
        max: Math.max(2400, v * 1.2)
      });
      setPressData(Array(14).fill(Math.round(v * 0.98)).concat([v]));
    }
  }, [sensorReadings]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTempData(prev => {
        const last = prev[prev.length - 1];
        const next = Math.max(metric1.min, Math.min(metric1.max, Number((last + (Math.random() * 2 - 0.9)).toFixed(1))));
        return [...prev.slice(1), next];
      });

      setVibeData(prev => {
        const last = prev[prev.length - 1];
        const delta = last > 100 ? Math.random() * 20 - 9.5 : Math.random() * 0.4 - 0.18;
        const next = Math.max(metric2.min, Math.min(metric2.max, Number((last + delta).toFixed(2))));
        return [...prev.slice(1), next];
      });

      setPressData(prev => {
        const last = prev[prev.length - 1];
        const delta = last < 100 ? Math.random() * 1.5 - 0.7 : Math.random() * 16 - 7.5;
        const next = Math.max(metric3.min, Math.min(metric3.max, Math.round(last + delta)));
        return [...prev.slice(1), next];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLive, metric1.min, metric1.max, metric2.min, metric2.max, metric3.min, metric3.max]);

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
        {/* Metric 1 */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: `1px solid ${metric1.isSpike ? '#DC2626' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {metric1.name}
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: metric1.isSpike ? '#EF4444' : 'var(--text-primary)'
            }}>
              {latestTemp} {metric1.unit}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            {renderSparkline(tempData, metric1.min, metric1.max, metric1.isSpike ? '#EF4444' : '#0284C7')}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {metric1.isSpike ? '⚠️ SPIKE' : 'NORM'}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: `1px solid ${metric2.isSpike ? '#D97706' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {metric2.name}
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: metric2.isSpike ? '#F59E0B' : 'var(--text-primary)'
            }}>
              {latestVibe} {metric2.unit}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            {renderSparkline(vibeData, metric2.min, metric2.max, metric2.isSpike ? '#F59E0B' : '#10B981')}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {metric2.isSpike ? '⚡ HIGH' : 'STABLE'}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          background: 'var(--bg-card-sub)',
          border: `1px solid ${metric3.isSpike ? '#DC2626' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {metric3.name}
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: metric3.isSpike ? '#EF4444' : 'var(--text-primary)'
            }}>
              {latestPress} {metric3.unit}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            {renderSparkline(pressData, metric3.min, metric3.max, metric3.isSpike ? '#EF4444' : '#3B82F6')}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {metric3.isSpike ? '⚠️ DROP' : 'NOMINAL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

