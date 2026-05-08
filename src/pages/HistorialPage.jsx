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
    <div className="flex-1 flex flex-col pb-24 px-4 pt-6">
      <h1 className="text-white text-2xl font-black mb-4">Historial</h1>

      <div className="flex gap-2 mb-5">
        <StatChip color="green" label="Pasaron" count={totalVerde} />
        <StatChip color="orange" label="Verif." count={totalNaranja} />
        <StatChip color="red" label="Rechazo" count={totalRojo} />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-white/40">
          Cargando...
        </div>
      ) : scans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/30">
          <span className="text-5xl">📋</span>
          <p>Sin escaneos todavía</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {scans.map((scan) => (
            <ScanRow key={scan.id} scan={scan} />
          ))}
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
    <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
      <div
        className={`px-2 py-1 rounded-lg text-xs font-bold border ${COLOR_BADGE[scan.result_color]}`}
      >
        {COLOR_LABEL[scan.result_color]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">
          {scan.person_name || 'Nombre desconocido'}
        </p>
        <p className="text-white/40 text-xs">
          {scan.guard_name} · {hora}
        </p>
      </div>
      <div className="text-white/30 text-xs shrink-0">{scan.person_dni}</div>
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
    <div className={`flex-1 rounded-xl border px-2 py-2 text-center ${classes[color]}`}>
      <p className="text-xl font-black">{count}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}
