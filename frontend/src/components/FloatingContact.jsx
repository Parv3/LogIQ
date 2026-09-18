import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setText('');
        setIsOpen(false);
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary no-print"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',
          zIndex: 999,
          borderRadius: 'var(--radius)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          gap: '0.4rem'
        }}
      >
        <MessageSquare size={16} />
        <span>Report Discrepancy</span>
      </button>

      {/* Modal Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="industrial-card" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <MessageSquare size={16} color="var(--accent-blue)" />
                <span>Shift Log Discrepancy & Feedback Form</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div style={{ color: 'var(--status-success)', fontSize: '0.85rem', padding: '1rem 0', fontWeight: 600 }}>
                ✓ Discrepancy report logged into shift audit queue.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  DESCRIBE OPERATIONAL OR SENSOR DISCREPANCY:
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter specific line, timestamp, or metric value discrepancy..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={14} />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
