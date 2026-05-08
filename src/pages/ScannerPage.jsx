import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';
import { parseDNI } from '../utils/dniParser';
import { verificarIngreso } from '../utils/ageLogic';
import { ResultCard } from '../components/ResultCard';
import { useConfig } from '../hooks/useConfig';
import { useScans } from '../hooks/useScans';

// Usa BarcodeDetector nativo si está disponible (iOS 17.4+, Chrome Android)
// Sino cae a ZXing como fallback
async function crearDetector() {
  if ('BarcodeDetector' in window) {
    try {
      const formatos = await window.BarcodeDetector.getSupportedFormats();
      const tienePDF = formatos.includes('pdf417') || formatos.includes('PDF_417');
      return new window.BarcodeDetector({
        formats: tienePDF ? ['pdf417', 'qr_code'] : formatos,
      });
    } catch {
      return null;
    }
  }
  return null;
}

export function ScannerPage() {
  const guardaNombre = localStorage.getItem('guardaNombre') || 'Sin nombre';
  const { config, loading } = useConfig();
  const { registrarScan } = useScans();

  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState(null);
  const [modoDetector, setModoDetector] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const activoRef = useRef(false);
  const configRef = useRef(config);

  useEffect(() => { configRef.current = config; }, [config]);

  const detenerScanner = useCallback(() => {
    activoRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setEscaneando(false);
  }, []);

  const procesarDNI = useCallback(async (raw) => {
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
      setError(e.message);
    }
  }, [guardaNombre, registrarScan]);

  const iniciarScanner = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
      });
      streamRef.current = stream;
      activoRef.current = true;
      setEscaneando(true);
    } catch {
      setError('No se pudo acceder a la cámara. Permitir acceso en Safari → Ajustes.');
    }
  };

  useEffect(() => {
    if (!escaneando || !videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    let cancelado = false;

    const arrancar = async () => {
      try {
        await video.play();
      } catch {}

      // Intentar detector nativo primero
      const detector = await crearDetector();

      if (detector) {
        setModoDetector('nativo');
        const loop = async () => {
          while (!cancelado && activoRef.current) {
            try {
              const codigos = await detector.detect(video);
              if (codigos.length > 0 && activoRef.current) {
                cancelado = true;
                detenerScanner();
                procesarDNI(codigos[0].rawValue);
                return;
              }
            } catch {}
            await new Promise((r) => setTimeout(r, 150));
          }
        };
        loop();
      } else {
        // Fallback: ZXing
        setModoDetector('zxing');
        const hints = new Map([[DecodeHintType.TRY_HARDER, true]]);
        const reader = new BrowserMultiFormatReader(hints);

        const loop = async () => {
          while (!cancelado && activoRef.current) {
            try {
              const result = await reader.decodeFromVideoElement(video);
              if (result && activoRef.current) {
                cancelado = true;
                detenerScanner();
                procesarDNI(result.getText());
                return;
              }
            } catch {}
            await new Promise((r) => setTimeout(r, 200));
          }
        };
        loop();
      }
    };

    arrancar();

    return () => {
      cancelado = true;
    };
  }, [escaneando, detenerScanner, procesarDNI]);

  useEffect(() => () => detenerScanner(), [detenerScanner]);

  const nuevoScan = () => {
    setResultado(null);
    setPersona(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40">
        Cargando configuración...
      </div>
    );
  }

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
          <p className="text-white/40 text-xs">Edad mín.</p>
          <p className="text-white font-bold text-lg">{config.edadMinima} años</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-white/40 text-xs">Edad máx.</p>
          <p className="text-white font-bold text-lg">{config.edadMaxima} años</p>
        </div>
        <div className="w-px bg-white/10" />
        <div>
          <p className="text-white/40 text-xs">Umbral</p>
          <p className="text-orange-400 font-bold text-lg">{config.umbralNaranja}m</p>
        </div>
      </div>

      <div className={`flex-1 flex flex-col gap-4 ${!escaneando ? 'hidden' : ''}`}>
        <div
          className="relative rounded-2xl overflow-hidden bg-black"
          style={{ aspectRatio: '4/3' }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-2 border-purple-400 rounded-lg"
              style={{ width: '85%', height: '38%' }}
            />
          </div>
          {modoDetector && (
            <div className="absolute top-2 right-2 bg-black/50 rounded-lg px-2 py-1">
              <p className="text-white/40 text-xs">{modoDetector}</p>
            </div>
          )}
        </div>
        <p className="text-white/50 text-sm text-center">
          Apuntá al código de barras del <span className="text-white font-bold">dorso</span> del DNI
        </p>
        <button
          onClick={detenerScanner}
          className="py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold active:scale-95 transition-transform"
        >
          CANCELAR
        </button>
      </div>

      {!escaneando && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-48 h-48 rounded-3xl border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-6xl opacity-30">📷</span>
          </div>
          {error && (
            <div className="w-full bg-red-900/30 border border-red-700 rounded-2xl px-4 py-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          <button
            onClick={iniciarScanner}
            className="w-full py-5 rounded-2xl bg-purple-600 text-white text-xl font-black tracking-wide active:scale-95 transition-transform shadow-[0_0_30px_rgba(147,51,234,0.4)]"
          >
            ESCANEAR DNI
          </button>
        </div>
      )}

      {resultado && persona && (
        <ResultCard resultado={resultado} persona={persona} onNuevoScan={nuevoScan} />
      )}
    </div>
  );
}
