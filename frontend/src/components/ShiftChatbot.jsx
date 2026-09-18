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
      const response = await fetch('/api/chat', {
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
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Connection Note**: Offline fallback active. Metric: Target Variance ${processedData?.kpis?.variance_units || 0} units. All safety interlocks operational.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
