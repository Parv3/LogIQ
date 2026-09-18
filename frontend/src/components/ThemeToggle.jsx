import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('logiq_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('logiq_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
      title="Toggle Light/Dark Theme"
    >
      {theme === 'dark' ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#0284C7" />}
      <span style={{ textTransform: 'capitalize' }}>{theme} Mode</span>
    </button>
  );
}
