import { useRef, useState, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { parseDNI } from '../utils/dniParser';
import { verificarIngreso } from '../utils/ageLogic';
import { ResultCard } from '../components/ResultCard';
import { useConfig } from '../hooks/useConfig';
import { useScans } from '../hooks/useScans';

const MAX_PX = 1200;

async function canvasDesdeArchivo(file) {
  // Aplica rotación EXIF correctamente (importante en fotos de celular)
  let source;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = rej;
      img.src = url;
    });
  }
  const ratio = Math.min(1, MAX_PX / Math.max(source.width, source.height));
  const w = Math.floor(source.width * ratio);
  const h = Math.floor(source.height * ratio);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(source, 0, 0, w, h);
  return c;
}

function rotarCanvas(orig, grados) {
  if (grados === 0) return orig;
  const c = document.createElement('canvas');
  const horiz = grados === 90 || grados === 270;
  c.width = horiz ? orig.height : orig.width;
  c.height = horiz ? orig.width : orig.height;
  const ctx = c.getContext('2d');
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((grados * Math.PI) / 180);
  ctx.drawImage(orig, -orig.width / 2, -orig.height / 2);
  return c;
}

async function decodificarImagen(file) {
  const canvas = await canvasDesdeArchivo(file);

  // 1) BarcodeDetector nativo — iOS 17.4+ y Chrome Android
  if ('BarcodeDetector' in window) {
    try {
      const formatos = await window.BarcodeDetector.getSupportedFormats();
      const detector = new window.BarcodeDetector({ formats: formatos });
      // Probar orientación original y rotaciones
      for (const grados of [0, 90, 270, 180]) {
        const c = rotarCanvas(canvas, grados);
        const res = await detector.detect(c);
        if (res.length > 0) return res[0].rawValue;
      }
    } catch {}
  }

  // 2) ZXing fallback — todos los demás navegadores
  const hints = new Map([[DecodeHintType.TRY_HARDER, true]]);
  const reader = new BrowserMultiFormatReader(hints);
  for (const grados of [0, 90, 270, 180]) {
    try {
      const c = rotarCanvas(canvas, grados);
      const result = await reader.decodeFromImageUrl(c.toDataURL('image/jpeg', 0.92));
      return result.getText();
    } catch {}
  }

  return null;
}

export function ScannerPage() {
  const guardaNombre = localStorage.getItem('guardaNombre') || 'Sin nombre';
  const { config, loading } = useConfig();
  const { registrarScan } = useScans();

  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; }, [config]);

  const procesarTexto = useCallback(async (raw) => {
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

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    setProcesando(true);
    setError(null);

    const texto = await decodificarImagen(file);

    if (texto) {
      procesarTexto(texto);
    } else {
      setError('No se detectó código. Probá con más luz y encuadrá bien el código de barras.');
      setProcesando(false);
    }
  };

  const nuevoScan = () => {
    setResultado(null);
    setPersona(null);
    setError(null);
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-white/40">Cargando...</div>;
  }

  const anioActual = new Date().getFullYear();

  return (
    <div className="flex-1 flex flex-col pb-20 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-xs">Seguridad</p>
          <p className="text-white font-bold text-lg">{guardaNombre}</p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Evento</p>
          <p className="text-purple-400 font-bold">{config.nombreEvento}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-3 mb-6 flex justify-around text-center">
        <div>
          <p className="text-white/40 text-xs">Nacidos desde</p>
          <p className="text-white font-bold text-lg">{config.anioNacDesde}</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-white/40 text-xs">Nacidos hasta</p>
          <p className="text-white font-bold text-lg">{config.anioNacHasta}</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-white/40 text-xs">Umbral</p>
          <p className="text-orange-400 font-bold text-lg">{config.umbralNaranja}m</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="w-44 h-44 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-5xl">{procesando ? '⏳' : '📷'}</span>
          </div>
          <p className="text-white/40 text-sm max-w-xs">
            Fotografiá el código de barras del <strong className="text-white/70">dorso</strong> del DNI.
            Buena luz y encuadrá solo el código.
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-900/30 border border-red-700 rounded-2xl px-4 py-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFoto}
          className="hidden"
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={procesando}
          className="w-full py-5 rounded-2xl bg-purple-600 text-white text-xl font-black tracking-wide active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(147,51,234,0.4)]"
        >
          {procesando ? 'LEYENDO...' : 'ESCANEAR DNI'}
        </button>
      </div>

      {resultado && persona && (
        <ResultCard resultado={resultado} persona={persona} onNuevoScan={nuevoScan} />
      )}
    </div>
  );
}
