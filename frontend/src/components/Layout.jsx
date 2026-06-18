import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitBranch, BarChart2, Calendar, Plus, Zap, TrendingUp, MapPin, ChevronDown } from 'lucide-react';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/roadmap', label: 'Roadmap', icon: Calendar },
  { to: '/graph', label: 'Abhängigkeiten', icon: GitBranch },
  { to: '/analysen', label: 'Analysen', icon: BarChart2 },
];

const rolloutNav = [
  { to: '/rollout/stationen', label: 'Netzstationen', icon: MapPin },
];

export function Layout({ onNewAktivitaet }) {
  const location = useLocation();
  const rolloutActive = location.pathname.startsWith('/rollout');

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col shrink-0">
        <div className="px-4 py-5 flex items-center gap-2 border-b border-slate-700">
          <Zap size={20} className="text-amber-400" />
          <span className="font-bold text-lg tracking-tight">M-Grid</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {mainNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {/* Rolloutfortschritt – aufklappbare Sektion */}
          <div className="pt-2">
            <NavLink
              to="/rollout"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  rolloutActive ? 'text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <TrendingUp size={17} />
              <span className="flex-1">Rolloutfortschritt</span>
              <ChevronDown size={13} className={`transition-transform ${rolloutActive ? 'rotate-180' : ''}`} />
            </NavLink>

            {rolloutActive && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                {rolloutNav.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={14} />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={onNewAktivitaet}
            className="flex items-center gap-2 w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Neue Aktivität
          </button>
        </div>
        <div className="px-4 py-3 text-xs text-slate-500">SWM Infrastruktur GmbH</div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
