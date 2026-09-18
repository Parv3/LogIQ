import React, { useState } from 'react';

export default function FooterBar({ onOpenPrivacy, onOpenTerms }) {
  const [cookieAccepted, setCookieAccepted] = useState(false);

  return (
    <>
      {/* Toast Banner matching image bottom-left */}
      {!cookieAccepted && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            background: 'var(--bg-card-sub)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 0.85rem',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 9999
          }}
        >
          <span>This site uses analytical cookies for system performance.</span>
          <div style={{ display: 'flex', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            <button
              onClick={() => setCookieAccepted(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}
            >
              [cite: 1] Accept
            </button>
            <button
              onClick={() => setCookieAccepted(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}
            >
              [cite: 1] Decline
            </button>
          </div>
        </div>
      )}

      <footer className="footer-bar no-print">
        <div>© 2026 LogIQ Industrial Inc. | <button onClick={onOpenPrivacy} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy Policy</button> | <button onClick={onOpenTerms} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Terms of Service</button></div>
      </footer>
    </>
  );
}
