import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map, Table2, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { StationModal } from '../components/StationModal';

const STATUS_CONFIG = {
  nicht_ausgestattet: { color: '#94a3b8', label: 'Nicht ausgestattet', bg: 'bg-slate-100 text-slate-600' },
  ausgestattet:       { color: '#eab308', label: 'Ausgestattet',        bg: 'bg-yellow-100 text-yellow-700' },
  aktiv:              { color: '#22c55e', label: 'Aktiv ausgelesen',    bg: 'bg-green-100 text-green-700' },
};

function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.nicht_ausgestattet;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg}`}>
      <span className="w-2 h-2 rounded-full inline-block" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, color, sub }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function Stationen() {
  const [stationen, setStationen] = useState([]);
  const [summary, setSummary] = useState(null);
  const [ansicht, setAnsicht] = useState('tabelle');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStation, setEditStation] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [items, sum] = await Promise.all([
        api.getStationen(filterStatus ? { status: filterStatus } : {}),
        api.getStationenSummary(),
      ]);
      setStationen(items);
      setSummary(sum);
    } catch {
      setStationen([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterStatus]);

  function openNew() { setEditStation({}); setModalOpen(true); }
  function openEdit(s) { setEditStation(s); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditStation(null); }
  async function handleSaved() { closeModal(); await load(); }

  async function handleDelete(id) {
    if (!confirm('Station wirklich löschen?')) return;
    await api.deleteStation(id);
    await load();
  }

  const mapStationen = stationen.filter((s) => s.lat && s.lng);
  const mapCenter = mapStationen.length > 0
    ? [mapStationen.reduce((a, s) => a + s.lat, 0) / mapStationen.length,
       mapStationen.reduce((a, s) => a + s.lng, 0) / mapStationen.length]
    : [48.137, 11.576]; // München fallback

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-slate-800">Netztrafo­stationen</h1>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm">
          <Plus size={15} /> Neue Station
        </button>
      </div>
      <p className="text-slate-500 text-sm mb-6">Digitalisierungsfortschritt der Netztrafo­stationen im Versorgungsgebiet</p>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Stationen gesamt" value={summary.gesamt} color="border-slate-400" />
          <KpiCard label="Nicht ausgestattet" value={summary.nicht_ausgestattet} color="border-slate-300" />
          <KpiCard label="Ausgestattet" value={summary.ausgestattet} color="border-yellow-400" sub="noch nicht aktiv" />
          <KpiCard label="Aktiv ausgelesen" value={summary.aktiv} color="border-green-400"
            sub={`${summary.quote_aktiv}% Digitalisierungsquote`} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <button onClick={() => setAnsicht('tabelle')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${ansicht === 'tabelle' ? 'bg-amber-500 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Table2 size={15} /> Tabelle
          </button>
          <button onClick={() => setAnsicht('karte')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${ansicht === 'karte' ? 'bg-amber-500 text-slate-900 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Map size={15} /> Karte
          </button>
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">Alle Status</option>
          <option value="nicht_ausgestattet">Nicht ausgestattet</option>
          <option value="ausgestattet">Ausgestattet</option>
          <option value="aktiv">Aktiv</option>
        </select>

        <span className="ml-auto text-sm text-slate-400">{stationen.length} Stationen</span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Lade…</div>
      ) : ansicht === 'tabelle' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {stationen.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">Noch keine Stationen erfasst</p>
              <p className="text-sm mt-1">Klicke auf „Neue Station" um zu beginnen</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b bg-slate-50">
                  <th className="px-5 py-3">Bezeichnung</th>
                  <th className="px-3 py-3">Stadtteil</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Ausgestattet am</th>
                  <th className="px-3 py-3">Aktiv seit</th>
                  <th className="px-3 py-3">Letztes Auslesen</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stationen.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {s.name}
                      {s.adresse && <p className="text-xs text-slate-400 mt-0.5">{s.adresse}</p>}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{s.stadtteil || '—'}</td>
                    <td className="px-3 py-3"><StatusChip status={s.status} /></td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{s.ausgestattet_am || '—'}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{s.aktiv_seit || '—'}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{s.letztes_auslesen || '—'}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(s)} className="text-slate-400 hover:text-slate-700 p-1"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 520 }}>
          {mapStationen.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 flex-col gap-2">
              <Map size={40} className="opacity-30" />
              <p>Keine Stationen mit Koordinaten vorhanden.</p>
              <p className="text-sm">Trage Breitengrad und Längengrad bei den Stationen ein.</p>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapStationen.map((s) => {
                const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.nicht_ausgestattet;
                return (
                  <CircleMarker
                    key={s.id}
                    center={[s.lat, s.lng]}
                    radius={10}
                    pathOptions={{
                      color: cfg.color,
                      fillColor: cfg.color,
                      fillOpacity: 0.85,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[160px]">
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        {s.stadtteil && <p className="text-slate-500">{s.stadtteil}</p>}
                        {s.adresse && <p className="text-slate-400 text-xs">{s.adresse}</p>}
                        <div className="mt-2">
                          <StatusChip status={s.status} />
                        </div>
                        {s.aktiv_seit && <p className="text-xs text-slate-400 mt-1">Aktiv seit: {s.aktiv_seit}</p>}
                        {s.letztes_auslesen && <p className="text-xs text-slate-400">Zuletzt: {s.letztes_auslesen}</p>}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>
      )}

      {/* Legende */}
      <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
        ))}
      </div>

      {modalOpen && (
        <StationModal station={editStation} onClose={closeModal} onSaved={handleSaved} />
      )}
    </div>
  );
}
