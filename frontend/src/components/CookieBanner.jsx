import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function CookieBanner() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('logiq_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('logiq_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="cookie-banner no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
        <ShieldAlert size={18} color="var(--accent-blue)" />
        <span>
          LogIQ uses essential local storage for theme settings and shift session security. No third-party tracking cookies are used.
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAccept} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
          Accept Essential
        </button>
      </div>
    </div>
  );
}
