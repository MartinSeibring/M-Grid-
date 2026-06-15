import { useEffect, useState } from 'react';
import { Pencil, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { TypBadge } from '../components/TypBadge';
import { VorhabenModal } from '../components/VorhabenModal';

function KpiCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const color = pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-slate-300';
  return (
    <div className="h-1.5 bg-slate-100 rounded-full w-24">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const RISIKO_COLORS = {
  hoch: 'text-red-500',
  mittel: 'text-amber-500',
  niedrig: 'text-green-500',
};

export function Dashboard({ modalOpen, setModalOpen }) {
  const [aktivitaeten, setAktivitaeten] = useState([]);
  const [summary, setSummary] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [filterTyp, setFilterTyp] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [items, sum] = await Promise.all([
      api.getAktivitaeten({ typ: filterTyp, status: filterStatus }),
      api.getSummary(),
    ]);
    setAktivitaeten(items);
    setSummary(sum);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filterTyp, filterStatus]);

  function openNew() { setEditItem({}); setModalOpen(true); }
  function openEdit(item) { setEditItem(item); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditItem(null); }
  async function handleSaved() { closeModal(); await load(); }

  async function handleDelete(id) {
    if (!confirm('Aktivität wirklich löschen?')) return;
    await api.deleteAktivitaet(id);
    await load();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Übersicht aller Vorhaben – Digitales Messen & Steuern</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard label="Gesamt" value={summary.gesamt} color="border-slate-400" />
          <KpiCard label="In Umsetzung" value={summary.nach_status?.umsetzung ?? 0} color="border-amber-400" />
          <KpiCard label="In Verzug" value={summary.in_verzug} color="border-red-400" />
          <KpiCard label="Abgeschlossen" value={summary.nach_status?.abgeschlossen ?? 0} color="border-green-400" />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b">
          <select value={filterTyp} onChange={(e) => setFilterTyp(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Alle Typen</option>
            <option value="projekt">Projekt</option>
            <option value="massnahme">Maßnahme</option>
            <option value="linientaetigkeit">Linientätigkeit</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">Alle Status</option>
            <option value="initiierung">Initiierung</option>
            <option value="planung">Planung</option>
            <option value="umsetzung">Umsetzung</option>
            <option value="abgeschlossen">Abgeschlossen</option>
            <option value="pausiert">Pausiert</option>
          </select>
          <span className="ml-auto text-sm text-slate-400">{aktivitaeten.length} Vorhaben</span>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-12">Lade…</p>
        ) : aktivitaeten.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Noch keine Vorhaben</p>
            <p className="text-sm mt-1">Klicke auf „Neue Aktivität" um ein Vorhaben anzulegen</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase tracking-wider border-b bg-slate-50">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-3 py-3">Typ</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Fortschritt</th>
                <th className="px-3 py-3">Risiko</th>
                <th className="px-3 py-3">Ende (geplant)</th>
                <th className="px-3 py-3">Verantwortl.</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {aktivitaeten.map((a) => {
                const heute = new Date().toISOString().slice(0, 10);
                const inVerzug = a.end_geplant && a.end_geplant < heute &&
                  !['abgeschlossen', 'pausiert'].includes(a.status) && (a.fortschritt ?? 0) < 100;
                const meta = a.metadaten || {};
                const risikoScore = ['niedrig', 'mittel', 'hoch'].indexOf(meta.risiko_eintritt ?? 'mittel')
                  * ['niedrig', 'mittel', 'hoch'].indexOf(meta.risiko_auswirkung ?? 'mittel');
                const risikoLevel = risikoScore >= 4 ? 'hoch' : risikoScore >= 1 ? 'mittel' : 'niedrig';

                return (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {meta.aktivitaet_id || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {inVerzug && <AlertTriangle size={13} className="text-red-400 shrink-0" />}
                        {meta.regulatorik && <ShieldAlert size={13} className="text-blue-400 shrink-0" title="Regulatorisch relevant" />}
                        <span>{a.name}</span>
                      </div>
                      {meta.mengengeber_bereich && (
                        <p className="text-xs text-slate-400 mt-0.5">{meta.mengengeber_bereich}</p>
                      )}
                    </td>
                    <td className="px-3 py-3"><TypBadge typ={a.typ} /></td>
                    <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={a.fortschritt} />
                        <span className="text-slate-400 text-xs">{a.fortschritt}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium capitalize ${RISIKO_COLORS[risikoLevel]}`}>
                        {risikoLevel}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{a.end_geplant || '—'}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{a.verantwortlicher || '—'}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(a)}
                          className="text-slate-400 hover:text-slate-700 p-1">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <VorhabenModal
          vorhaben={editItem}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
