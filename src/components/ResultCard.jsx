const COLORS = {
  green: {
    bg: 'bg-green-500',
    border: 'border-green-400',
    glow: 'shadow-[0_0_80px_rgba(34,197,94,0.5)]',
    icon: '✓',
  },
  orange: {
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    glow: 'shadow-[0_0_80px_rgba(249,115,22,0.5)]',
    icon: '⚠',
  },
  red: {
    bg: 'bg-red-600',
    border: 'border-red-500',
    glow: 'shadow-[0_0_80px_rgba(239,68,68,0.5)]',
    icon: '✗',
  },
};

import { useEffect } from 'react';

export function ResultCard({ resultado, persona, onNuevoScan }) {
  const c = COLORS[resultado.color];

  // Permite cerrar con Enter o Escape sin tocar el mouse
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') onNuevoScan();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNuevoScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 w-full max-w-lg px-6">
        <div
          className={`w-full rounded-3xl border-2 ${c.border} ${c.bg} ${c.glow} p-10 flex flex-col items-center gap-5`}
        >
          <div className="text-8xl font-black leading-none">{c.icon}</div>

          <div className="text-4xl font-black tracking-wide text-white text-center uppercase">
            {resultado.titulo}
          </div>

          <div className="w-full bg-black/20 rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold text-white">{persona.nombreCompleto}</p>
            <p className="text-base text-white/80 mt-1">DNI: {persona.dni}</p>
            <p className="text-xl font-semibold text-white mt-2">{resultado.edad}</p>
          </div>

          <div className="text-center text-white text-lg font-medium">
            {resultado.detalle}
          </div>
        </div>

        <button
          onClick={onNuevoScan}
          className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-lg font-bold hover:bg-white/20 transition-colors"
        >
          ESCANEAR OTRO — <kbd className="text-white/50 text-sm font-mono">Enter</kbd>
        </button>
      </div>
    </div>
  );
}
