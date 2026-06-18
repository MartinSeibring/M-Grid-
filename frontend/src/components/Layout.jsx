import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitBranch, BarChart2, Calendar, Plus, Zap, TrendingUp, MapPin, ChevronDown, Menu, X } from 'lucide-react';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/roadmap', label: 'Roadmap', icon: Calendar },
  { to: '/graph', label: 'Abhängigkeiten', icon: GitBranch },
  { to: '/analysen', label: 'Analysen', icon: BarChart2 },
];

const rolloutNav = [
  { to: '/rollout/stationen', label: 'Netzstationen', icon: MapPin },
];

function SidebarContent({ onNewAktivitaet, onClose }) {
  const location = useLocation();
  const rolloutActive = location.pathname.startsWith('/rollout');

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <>
      <div className="px-4 py-5 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-amber-400" />
          <span className="font-bold text-lg tracking-tight">M-Grid</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {mainNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="pt-2">
          <NavLink
            to="/rollout"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                rolloutActive ? 'text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
            onClick={onClose}
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
                    `flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  onClick={onClose}
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
          onClick={() => { onNewAktivitaet(); onClose?.(); }}
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Neue Aktivität
        </button>
      </div>
      <div className="px-4 py-3 text-xs text-slate-500">SWM Infrastruktur GmbH</div>
    </>
  );
}

export function Layout({ onNewAktivitaet }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop-Sidebar */}
      <aside className="hidden md:flex w-56 bg-slate-900 text-slate-100 flex-col shrink-0">
        <SidebarContent onNewAktivitaet={onNewAktivitaet} />
      </aside>

      {/* Mobile: Overlay-Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-100 flex flex-col h-full shadow-xl">
            <SidebarContent
              onNewAktivitaet={onNewAktivitaet}
              onClose={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 text-white shrink-0">
          <button onClick={() => setMenuOpen(true)} className="text-slate-300 hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={17} className="text-amber-400" />
            <span className="font-bold tracking-tight">M-Grid</span>
          </div>
          <div className="ml-auto">
            <button
              onClick={onNewAktivitaet}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-sm font-semibold"
            >
              <Plus size={14} />
              Neu
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
