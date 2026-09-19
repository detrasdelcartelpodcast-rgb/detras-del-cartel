import React from 'react';
import { Sun, Moon } from 'lucide-react';

// Botón día / noche. En modo noche muestra el sol (para pasar a día) y viceversa.
export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const aDia = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={aDia ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      title={aDia ? 'Modo día' : 'Modo noche'}
      className={`p-2 rounded-full border border-line/15 bg-card/60 text-muted hover:text-fg hover:border-accent/50 transition ${className}`}
    >
      {aDia ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
