import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/scanner', label: 'Escanear', icon: '📷' },
  { to: '/config', label: 'Ajustes', icon: '⚙️' },
  { to: '/historial', label: 'Historial', icon: '📋' },
];

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#111118] border-t border-white/10 pb-safe">
      <div className="flex">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-purple-400' : 'text-white/40'
              }`
            }
          >
            <span className="text-2xl">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
