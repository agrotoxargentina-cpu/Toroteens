import { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';

export function ConfigPage() {
  const guardaNombre = localStorage.getItem('guardaNombre') || 'Sin nombre';
  const { config, loading, guardarConfig } = useConfig();

  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (config && !form) setForm({ ...config });
  }, [config]);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje(null);

    if (form.anioNacDesde >= form.anioNacHasta) {
      setMensaje({ tipo: 'error', texto: 'El año mínimo debe ser menor al año máximo' });
      setGuardando(false);
      return;
    }

    const ok = await guardarConfig(form, guardaNombre);
    setMensaje(
      ok
        ? { tipo: 'ok', texto: 'Configuración guardada y sincronizada' }
        : { tipo: 'error', texto: 'Error al guardar. Revisá la conexión.' }
    );
    setGuardando(false);
  };

  if (loading || !form) {
    return <div className="flex-1 flex items-center justify-center text-white/40 text-lg">Cargando...</div>;
  }

  const anioActual = new Date().getFullYear();

  return (
    <div className="flex-1">
      <h1 className="text-white text-2xl font-black mb-6">Ajustes</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Evento</p>
            <Field
              label="Nombre del evento"
              value={form.nombreEvento}
              type="text"
              onChange={(v) => handleChange('nombreEvento', v)}
            />
          </div>

          <div className="bg-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Años de nacimiento permitidos</p>
            <p className="text-white/30 text-xs mb-4">
              Ejemplo: desde 2007 hasta 2013 permite a nacidos entre esos años
            </p>
            <div className="flex gap-4">
              <Field
                label={`Desde (en ${form.anioNacDesde} o después)`}
                value={form.anioNacDesde}
                type="number"
                min={1990}
                max={anioActual}
                onChange={(v) => handleChange('anioNacDesde', parseInt(v))}
              />
              <Field
                label={`Hasta (en ${form.anioNacHasta} o antes)`}
                value={form.anioNacHasta}
                type="number"
                min={1990}
                max={anioActual}
                onChange={(v) => handleChange('anioNacHasta', parseInt(v))}
              />
            </div>
            <div className="mt-4 bg-white/5 rounded-xl px-4 py-3 text-center">
              <p className="text-white/40 text-xs">Rango actual</p>
              <p className="text-purple-400 font-bold text-lg">
                Nacidos {form.anioNacDesde} – {form.anioNacHasta}
              </p>
              <p className="text-white/30 text-xs">
                ({anioActual - form.anioNacHasta} a {anioActual - form.anioNacDesde} años aprox.)
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Umbral zona naranja</p>
            <p className="text-white/30 text-xs mb-4">
              Meses fuera del rango que muestran advertencia en lugar de rechazo directo
            </p>
            <Field
              label="Meses de tolerancia (zona naranja)"
              value={form.umbralNaranja}
              type="number"
              min={0}
              max={24}
              onChange={(v) => handleChange('umbralNaranja', parseInt(v))}
            />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 rounded-2xl p-6">
            <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Sesión</p>
            <p className="text-white/60 text-sm mb-1">Accediste como:</p>
            <p className="text-purple-400 font-bold text-xl mb-4">{guardaNombre}</p>
            <button
              onClick={() => { localStorage.removeItem('guardaNombre'); window.location.href = '/'; }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              Cambiar nombre
            </button>
          </div>

          {mensaje && (
            <div className={`rounded-2xl px-5 py-4 text-sm text-center font-medium border ${
              mensaje.tipo === 'ok'
                ? 'bg-green-900/30 border-green-700 text-green-300'
                : 'bg-red-900/30 border-red-700 text-red-300'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full py-4 rounded-2xl bg-purple-600 text-white text-lg font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            {guardando ? 'GUARDANDO...' : 'GUARDAR Y SINCRONIZAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, type, onChange, min, max }) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-white/50 text-xs">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-base outline-none focus:border-purple-500 transition-colors w-full"
      />
    </div>
  );
}
