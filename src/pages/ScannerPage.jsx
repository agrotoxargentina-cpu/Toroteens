import { useRef, useState, useEffect, useCallback } from 'react';
import { parseDNI } from '../utils/dniParser';
import { verificarIngreso } from '../utils/ageLogic';
import { ResultCard } from '../components/ResultCard';
import { useConfig } from '../hooks/useConfig';
import { useScans } from '../hooks/useScans';

export function ScannerPage() {
  const guardaNombre = localStorage.getItem('guardaNombre') || 'Sin nombre';
  const { config, loading } = useConfig();
  const { registrarScan } = useScans();

  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const bufferRef = useRef('');
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const procesarTexto = useCallback(async (raw) => {
    setProcesando(true);
    setError(null);
    try {
      const dni = parseDNI(raw);
      const res = verificarIngreso(dni.fechaNacimiento, configRef.current);
      setPersona(dni);
      setResultado(res);
      await registrarScan({
        guard_name: guardaNombre,
        person_name: dni.nombreCompleto,
        person_dni: dni.dni,
        person_birthdate: dni.fechaNacimiento,
        result_color: res.color,
        result_message: res.titulo + ' — ' + res.detalle,
      });
    } catch (e) {
      setError('Error al leer el DNI: ' + e.message);
    }
    setProcesando(false);
  }, [guardaNombre, registrarScan]);

  // Captura keystrokes del lector USB QR (actúa como teclado HID)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (resultado) return;

      if (e.key === 'Enter') {
        const texto = bufferRef.current.trim();
        bufferRef.current = '';
        if (texto) procesarTexto(texto);
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resultado, procesarTexto]);

  useEffect(() => {
    if (!resultado) inputRef.current?.focus();
  }, [resultado]);

  const nuevoScan = () => {
    setResultado(null);
    setPersona(null);
    setError(null);
    bufferRef.current = '';
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-white/40 text-lg">Cargando...</div>;
  }

  const anioActual = new Date().getFullYear();

  return (
    <div className="flex-1 flex flex-col" onClick={() => inputRef.current?.focus()}>
      {/* Input invisible — mantiene el foco para capturar el lector */}
      <input
        ref={inputRef}
        type="text"
        autoFocus
        readOnly
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={0}
      />

      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Columna izquierda: área de escaneo */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Área principal de escaneo */}
          <div className={`flex-1 flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed transition-colors p-12 ${
            procesando ? 'border-purple-500 bg-purple-500/5' : 'border-white/15 bg-white/3'
          }`}>
            <div className={`w-40 h-40 rounded-3xl border-2 flex items-center justify-center transition-colors ${
              procesando ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 bg-white/5'
            }`}>
              <span className="text-7xl">{procesando ? '⏳' : '🔌'}</span>
            </div>

            <div className="text-center">
              <p className={`text-2xl font-black tracking-wide mb-2 ${procesando ? 'text-purple-400' : 'text-white/60'}`}>
                {procesando ? 'LEYENDO...' : 'ESPERANDO ESCANEO'}
              </p>
              <p className="text-white/30 text-sm max-w-sm">
                {procesando
                  ? 'Procesando el código del DNI'
                  : 'Apuntá la lectora QR al código de barras del dorso del DNI y presioná el gatillo'
                }
              </p>
            </div>

            {error && (
              <div className="w-full max-w-md bg-red-900/30 border border-red-700 rounded-2xl px-5 py-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: info del operador y config */}
        <div className="flex flex-col gap-4">
          {/* Operador */}
          <div className="bg-white/5 rounded-2xl p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Seguridad</p>
            <p className="text-white font-bold text-xl">{guardaNombre}</p>
            <p className="text-white/40 text-xs mt-2 uppercase tracking-wider">Evento</p>
            <p className="text-purple-400 font-bold text-base">{config.nombreEvento}</p>
          </div>

          {/* Configuración activa */}
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">Configuración activa</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Nacidos desde</span>
                <span className="text-white font-bold">{config.anioNacDesde}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Nacidos hasta</span>
                <span className="text-white font-bold">{config.anioNacHasta}</span>
              </div>
              <div className="w-full h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Edades aprox.</span>
                <span className="text-white/70 text-sm">
                  {anioActual - config.anioNacHasta}–{anioActual - config.anioNacDesde} años
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Zona naranja</span>
                <span className="text-orange-400 font-bold">{config.umbralNaranja} meses</span>
              </div>
            </div>
          </div>

          {/* Leyenda de colores */}
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col gap-2">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Leyenda</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
              <span className="text-white/60 text-sm">Puede ingresar</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span className="text-white/60 text-sm">Verificar manualmente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
              <span className="text-white/60 text-sm">No puede ingresar</span>
            </div>
          </div>
        </div>
      </div>

      {resultado && persona && (
        <ResultCard resultado={resultado} persona={persona} onNuevoScan={nuevoScan} />
      )}
    </div>
  );
}
