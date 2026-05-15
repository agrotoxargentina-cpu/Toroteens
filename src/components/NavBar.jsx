import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/scanner', label: 'Escanear', icon: '🔌' },
  { to: '/config', label: 'Ajustes', icon: '⚙️' },
  { to: '/historial', label: 'Historial', icon: '📋' },
];

export function NavBar() {
  return (
    <nav className="bg-[#111118] border-b border-white/10 shrink-0">
      <div className="max-w-6xl mx-auto flex items-center gap-1 px-6 h-14">
        <span className="text-purple-400 font-black text-lg tracking-tight mr-8">
          TORO<span className="text-yellow-400">TEENS</span>
        </span>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`
            }
          >
            <span>{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
