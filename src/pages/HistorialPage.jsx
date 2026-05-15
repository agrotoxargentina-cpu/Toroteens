import { useScans } from '../hooks/useScans';

const COLOR_BADGE = {
  green: 'bg-green-900/50 text-green-300 border-green-700',
  orange: 'bg-orange-900/50 text-orange-300 border-orange-700',
  red: 'bg-red-900/50 text-red-300 border-red-700',
};

const COLOR_LABEL = {
  green: 'PASÓ',
  orange: 'VERIFICAR',
  red: 'RECHAZADO',
};

export function HistorialPage() {
  const { scans, loading } = useScans();

  const totalVerde = scans.filter((s) => s.result_color === 'green').length;
  const totalNaranja = scans.filter((s) => s.result_color === 'orange').length;
  const totalRojo = scans.filter((s) => s.result_color === 'red').length;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-black">Historial</h1>
        <div className="flex gap-3">
          <StatChip color="green" label="Pasaron" count={totalVerde} />
          <StatChip color="orange" label="Verificar" count={totalNaranja} />
          <StatChip color="red" label="Rechazados" count={totalRojo} />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-white/40 text-lg">
          Cargando...
        </div>
      ) : scans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30">
          <span className="text-5xl">📋</span>
          <p className="text-lg">Sin escaneos todavía</p>
        </div>
      ) : (
        <div className="bg-white/3 rounded-2xl overflow-hidden border border-white/10">
          {/* Encabezado tabla */}
          <div className="grid grid-cols-[110px_1fr_160px_100px_80px] gap-4 px-5 py-3 border-b border-white/10">
            <span className="text-white/30 text-xs uppercase tracking-wider">Estado</span>
            <span className="text-white/30 text-xs uppercase tracking-wider">Nombre</span>
            <span className="text-white/30 text-xs uppercase tracking-wider">Detalle</span>
            <span className="text-white/30 text-xs uppercase tracking-wider">Operador</span>
            <span className="text-white/30 text-xs uppercase tracking-wider text-right">Hora</span>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {scans.map((scan) => (
              <ScanRow key={scan.id} scan={scan} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScanRow({ scan }) {
  const hora = new Date(scan.scanned_at).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="grid grid-cols-[110px_1fr_160px_100px_80px] gap-4 px-5 py-4 items-center hover:bg-white/5 transition-colors">
      <div>
        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${COLOR_BADGE[scan.result_color]}`}>
          {COLOR_LABEL[scan.result_color]}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-white font-medium text-sm truncate">
          {scan.person_name || 'Nombre desconocido'}
        </p>
        <p className="text-white/30 text-xs">DNI: {scan.person_dni}</p>
      </div>
      <div className="text-white/40 text-xs truncate">{scan.result_message?.split('—')[1]?.trim() || ''}</div>
      <div className="text-white/40 text-xs truncate">{scan.guard_name}</div>
      <div className="text-white/30 text-xs text-right">{hora}</div>
    </div>
  );
}

function StatChip({ color, label, count }) {
  const classes = {
    green: 'bg-green-900/30 text-green-300 border-green-800',
    orange: 'bg-orange-900/30 text-orange-300 border-orange-800',
    red: 'bg-red-900/30 text-red-300 border-red-800',
  };
  return (
    <div className={`rounded-xl border px-4 py-2 flex items-center gap-2 ${classes[color]}`}>
      <span className="text-xl font-black">{count}</span>
      <span className="text-xs opacity-80">{label}</span>
    </div>
  );
}
