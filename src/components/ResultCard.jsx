const COLORS = {
  green: {
    bg: 'bg-green-500',
    border: 'border-green-400',
    glow: 'shadow-[0_0_60px_rgba(34,197,94,0.5)]',
    icon: '✓',
  },
  orange: {
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    glow: 'shadow-[0_0_60px_rgba(249,115,22,0.5)]',
    icon: '⚠',
  },
  red: {
    bg: 'bg-red-600',
    border: 'border-red-500',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.5)]',
    icon: '✗',
  },
};

export function ResultCard({ resultado, persona, onNuevoScan }) {
  const c = COLORS[resultado.color];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4">
      <div
        className={`w-full max-w-sm rounded-3xl border-2 ${c.border} ${c.bg} ${c.glow} p-8 flex flex-col items-center gap-4`}
      >
        <div className="text-7xl font-black">{c.icon}</div>

        <div className="text-3xl font-black tracking-wide text-white text-center uppercase">
          {resultado.titulo}
        </div>

        <div className="w-full bg-black/20 rounded-2xl p-4 text-center">
          <p className="text-xl font-bold text-white">{persona.nombreCompleto}</p>
          <p className="text-sm text-white/80 mt-1">DNI: {persona.dni}</p>
          <p className="text-lg font-semibold text-white mt-2">{resultado.edad}</p>
        </div>

        <div className="text-center text-white text-base font-medium px-2">
          {resultado.detalle}
        </div>
      </div>

      <button
        onClick={onNuevoScan}
        className="mt-6 w-full max-w-sm py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-lg font-bold active:scale-95 transition-transform"
      >
        ESCANEAR OTRO
      </button>
    </div>
  );
}
