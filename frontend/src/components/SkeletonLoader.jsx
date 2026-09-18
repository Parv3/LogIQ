import React from 'react';

export default function SkeletonLoader({ type = 'cards' }) {
  if (type === 'report') {
    return (
      <div className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        <div className="skeleton-box" style={{ width: '40%', height: '24px' }} />
        <div className="skeleton-box" style={{ width: '80%', height: '16px' }} />
        <div className="skeleton-box" style={{ width: '60%', height: '16px' }} />
        
        <div className="skeleton-box" style={{ width: '35%', height: '20px', marginTop: '1rem' }} />
        <div className="skeleton-box" style={{ width: '100%', height: '14px' }} />
        <div className="skeleton-box" style={{ width: '90%', height: '14px' }} />
        <div className="skeleton-box" style={{ width: '95%', height: '14px' }} />
      </div>
    );
  }

  return (
    <div className="grid-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="industrial-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className="skeleton-box" style={{ width: '50%', height: '12px' }} />
          <div className="skeleton-box" style={{ width: '70%', height: '28px' }} />
          <div className="skeleton-box" style={{ width: '90%', height: '10px' }} />
        </div>
      ))}
    </div>
  );
}
