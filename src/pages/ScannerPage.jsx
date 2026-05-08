import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { parseDNI } from '../utils/dniParser';
import { verificarIngreso } from '../utils/ageLogic';
import { ResultCard } from '../components/ResultCard';
import { useConfig } from '../hooks/useConfig';
import { useScans } from '../hooks/useScans';

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417, BarcodeFormat.QR_CODE]],
  [DecodeHintType.TRY_HARDER, true],
]);

export function ScannerPage() {
  const guardaNombre = localStorage.getItem('guardaNombre') || 'Sin nombre';
  const { config, loading } = useConfig();
  const { registrarScan } = useScans();

  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [persona, setPersona] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  const detenerScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setEscaneando(false);
  };

  const iniciarScanner = async () => {
    setError(null);
    setEscaneando(true);
  };

  useEffect(() => {
    if (!escaneando || !videoRef.current) return;

    let activo = true;
    const reader = new BrowserMultiFormatReader(HINTS);

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (!activo) return;
        if (result) {
          activo = false;
          if (controlsRef.current) {
            controlsRef.current.stop();
            controlsRef.current = null;
          }
          setEscaneando(false);
          procesarDNI(result.getText());
        }
      })
      .then((controls) => {
        if (!activo) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      })
      .catch(() => {
        setError('No se pudo acceder a la cámara. Verificá los permisos.');
        setEscaneando(false);
      });

    return () => {
      activo = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, [escaneando]);

  const procesarDNI = async (raw) => {
    try {
      const dni = parseDNI(raw);
      const res = verificarIngreso(dni.fechaNacimiento, config);
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
  };

  const nuevoScan = () => {
    setResultado(null);
    setPersona(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, []);

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

      {!escaneando ? (
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
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-36 border-2 border-purple-400 rounded-lg opacity-70" />
            </div>
          </div>
          <p className="text-white/40 text-sm text-center">
            Apuntá al código de barras del dorso del DNI
          </p>
          <button
            onClick={detenerScanner}
            className="py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold active:scale-95 transition-transform"
          >
            CANCELAR
          </button>
        </div>
      )}

      {resultado && persona && (
        <ResultCard resultado={resultado} persona={persona} onNuevoScan={nuevoScan} />
      )}
    </div>
  );
}
