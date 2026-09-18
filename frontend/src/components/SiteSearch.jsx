import React from 'react';
import { Search, X } from 'lucide-react';

export default function SiteSearch({ searchQuery, setSearchQuery }) {
  return (
    <div style={{ position: 'relative', minWidth: '220px' }}>
      <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Filter logs, metrics, or alarms..."
        style={{
          width: '100%',
          padding: '0.45rem 2rem 0.45rem 2.1rem',
          background: 'var(--bg-main)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-sans)',
          outline: 'none'
        }}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
