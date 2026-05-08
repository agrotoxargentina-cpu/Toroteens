import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SetupPage() {
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return;
    localStorage.setItem('guardaNombre', n);
    navigate('/scanner');
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-[#0a0a0f]">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="text-6xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            TORO
          </div>
          <div className="text-2xl font-bold text-white/60 tracking-widest">TEENS</div>
          <div className="text-sm text-white/30 mt-1">Control de acceso</div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-sm font-medium">Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan, Seguridad 1..."
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-lg placeholder:text-white/20 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!nombre.trim()}
            className="w-full py-4 rounded-2xl bg-purple-600 text-white text-lg font-bold disabled:opacity-30 active:scale-95 transition-all"
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
}
