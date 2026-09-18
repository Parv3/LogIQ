import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';

export default function SensorChart({ sensorReadings }) {
  if (!sensorReadings || sensorReadings.length === 0) {
    return (
      <div className="industrial-card" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        No sensor time series data available for plotting.
      </div>
    );
  }

  // Format data for Recharts by timestamp
  const timeMap = {};
  sensorReadings.forEach(r => {
    if (!timeMap[r.timestamp]) {
      timeMap[r.timestamp] = { timestamp: r.timestamp };
    }
    timeMap[r.timestamp][r.metric] = r.value;
  });

  const chartData = Object.values(timeMap).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div className="industrial-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--accent-blue)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>8-Hour Industrial Sensor Time-Series Visualizer</h3>
        </div>
        <span className="badge badge-info">Z-Score Threshold Bands Active</span>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
            <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-header)',
                borderColor: 'var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            {/* Anomaly Upper Control Limit line */}
            <ReferenceLine y={90} label={{ value: 'UCL (90°C Anomaly Limit)', fill: '#DC2626', fontSize: 10 }} stroke="#DC2626" strokeDasharray="4 4" />
            <ReferenceLine y={75} label={{ value: 'Warning Limit (75°C)', fill: '#D97706', fontSize: 10 }} stroke="#D97706" strokeDasharray="4 4" />

            <Line type="monotone" dataKey="gearbox_temp_c" name="Gearbox Temp (°C)" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="hydraulic_pressure_bar" name="Hydraulic Pressure (bar)" stroke="#0284C7" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="vibration_mm_s" name="Vibration (mm/s)" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
