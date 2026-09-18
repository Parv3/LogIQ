import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, ShieldCheck, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ShiftChatbot({ activeShiftId, processedData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**LogIQ Operational Analytics Assistant Online.**\nI can analyze equipment anomalies, downtime root-causes, and active alarms for **Shift ${activeShiftId || 'LOADED'}**. How can I assist you?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "⚠️ Active Safety Alarms",
    "📈 Sensor Anomalies",
    "🛠️ Mandatory Maintenance",
    "📊 Production KPI Summary"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const apiEndpoint = window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api/chat'
        : '/api/chat';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift_id: activeShiftId || 'SHIFT-2026-A1',
          message: query,
          history: messages.slice(-6),
          processed_data: processedData || null
        })
      });

      if (!response.ok) throw new Error('Assistant API temporary error');

      const resData = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: resData.reply,
          sources: resData.sources,
          guardrailVerified: resData.guardrail_verified,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      const fallbackReply = generateClientFallbackReply(query, processedData);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  function generateClientFallbackReply(queryText, data) {
    const q = (queryText || '').toLowerCase();
    
    if (!data) {
      return "LogIQ Assistant online. Shift data is currently loading. Select a scenario from the top panel to inspect operational metrics.";
    }

    const { kpis, anomalies, safety_alarms, mandatory_maintenance, evidence_table } = data;

    if (q.includes('maintenance') || q.includes('task') || q.includes('unresolved')) {
      if (mandatory_maintenance && mandatory_maintenance.length > 0) {
        const items = mandatory_maintenance.map(m => `• **[${m.task_id || 'TASK'}] ${m.component || 'Component'}**: ${m.description} *(Status: ${m.status})*`).join('\n');
        return `**Mandatory Maintenance Requirements (${mandatory_maintenance.length})**:\n${items}\n\n*Action Required*: Sign off maintenance work orders prior to shift handover authorization.`;
      }
      return "No mandatory maintenance tasks pending for this shift.";
    }

    if (q.includes('alarm') || q.includes('safety') || q.includes('critical')) {
      if (safety_alarms && safety_alarms.length > 0) {
        const items = safety_alarms.map(a => `• **[${a.alarm_id}] ${a.description}** at ${a.timestamp}`).join('\n');
        return `**Active Critical Safety Alarms (${safety_alarms.length})**:\n${items}\n\n*Priority Zero Rule*: Do NOT suppress safety interlocks under any operational override condition.`;
      }
      return "All safety interlocks and machine pressure boundaries are operating within normal limits. 0 critical alarms active.";
    }

    if (q.includes('anomaly') || q.includes('sensor') || q.includes('temp') || q.includes('vibration')) {
      const flagged = (anomalies || []).filter(a => a.is_anomaly);
      if (flagged.length > 0) {
        const items = flagged.map(a => `• **${a.metric}**: Peak **${a.value}** (Baseline: ${a.baseline_mean}, Z-Score: +${a.z_score}) - ${a.status}`).join('\n');
        return `**Statistical Sensor Anomalies Flagged (|Z| > 2.5)**:\n${items}\n\n*Investigation Hypothesis*: Review evidence table correlation matrix for thermal spikes and lubrication pump cavitation.`;
      }
      return "All sensor time-series metrics (bearing temp, line speed, vibration) are within normal baseline statistical bounds (|Z| < 2.5).";
    }

    if (q.includes('kpi') || q.includes('target') || q.includes('actual') || q.includes('oee') || q.includes('downtime')) {
      if (kpis) {
        return `**Shift ${data.shift_id || 'ACTIVE'} Production KPI Briefing**:\n• **Target vs Actual**: ${kpis.actual_units} / ${kpis.target_units} units (Variance: ${kpis.variance_units} units, ${kpis.variance_percent}%)\n• **OEE**: ${kpis.oee_percent}%\n• **Total Downtime**: ${kpis.total_downtime_minutes} mins\n• **Scrap Rate**: ${kpis.scrap_rate_percent}%`;
      }
    }

    return `**LogIQ Operational Briefing (${data.shift_id || 'Active Shift'})**:\nProduced **${kpis?.actual_units || 0} units** against **${kpis?.target_units || 0} target** with **${kpis?.total_downtime_minutes || 0} mins** total downtime. Active safety alarms: ${safety_alarms?.length || 0}, Mandatory maintenance tasks: ${mandatory_maintenance?.length || 0}.`;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary no-print"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          gap: '0.5rem',
          padding: '0.65rem 1.1rem',
          fontWeight: 700,
          letterSpacing: '0.04em'
        }}
        title="Open Industrial Operational AI Assistant"
      >
        <Bot size={18} />
        <span>Operational AI Chat</span>
        {processedData?.anomalies?.some(a => a.is_anomaly) && (
          <span style={{
            background: 'var(--status-danger)',
            color: '#FFF',
            fontSize: '0.65rem',
            padding: '2px 6px',
            borderRadius: '2px',
            fontWeight: 800
          }}>
            ANOMALY
          </span>
        )}
      </button>

      {/* Floating Drawer / Side Panel */}
      {isOpen && (
        <div
          className="industrial-card no-print"
          style={{
            position: 'fixed',
            bottom: '5.2rem',
            right: '1.5rem',
            width: '420px',
            maxWidth: 'calc(100vw - 2rem)',
            height: '580px',
            maxHeight: 'calc(100vh - 7rem)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '0.85rem 1rem',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-blue)',
                padding: '0.4rem',
                borderRadius: 'var(--radius)',
                display: 'flex'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Operational Analytics Assistant
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} color="var(--status-success)" />
                  <span>Sanitization & SQLi Shield Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div style={{
            padding: '0.5rem 0.85rem',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="btn btn-secondary"
                disabled={loading}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-main)'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-secondary)',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {msg.role === 'user' ? 'Floor Operator' : 'LogIQ AI Assistant'} • {msg.timestamp}
                </div>
                <div
                  style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    background: msg.role === 'user'
                      ? 'var(--accent-blue)'
                      : 'var(--bg-card)',
                    color: msg.role === 'user'
                      ? '#FFFFFF'
                      : 'var(--text-primary)',
                    border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.content}

                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{
                      marginTop: '0.5rem',
                      paddingTop: '0.4rem',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong>Verified Evidence Sources:</strong> {msg.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <RefreshCw size={14} className="spin" />
                <span>Processing operational metrics & safety guardrails...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem',
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about anomalies, alarms, downtime..."
              disabled={loading}
              maxLength={500}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ padding: '0.55rem 0.85rem' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
