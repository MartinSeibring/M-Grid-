import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api } from '../api/client';

const STATUS_COLORS_MAP = {
  initiierung: '#94a3b8',
  planung: '#3b82f6',
  umsetzung: '#f59e0b',
  abgeschlossen: '#22c55e',
  pausiert: '#ef4444',
};

const STATUS_LABELS = {
  initiierung: 'Initiierung',
  planung: 'Planung',
  umsetzung: 'Umsetzung',
  abgeschlossen: 'Abgeschlossen',
  pausiert: 'Pausiert',
};

const TYP_COLORS_MAP = {
  projekt: '#7c3aed',
  massnahme: '#0891b2',
  linientaetigkeit: '#ea580c',
};

const TYP_LABELS = {
  projekt: 'Projekte',
  massnahme: 'Maßnahmen',
  linientaetigkeit: 'Linientätigkeiten',
};

export function Analysen() {
  const [summary, setSummary] = useState(null);
  const [aktivitaeten, setAktivitaeten] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSummary(), api.getAktivitaeten()]).then(([s, items]) => {
      setSummary(s);
      setAktivitaeten(items);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-slate-400">Lade…</div>;

  const statusData = Object.entries(summary.nach_status).map(([key, val]) => ({
    name: STATUS_LABELS[key] || key,
    value: val,
    color: STATUS_COLORS_MAP[key] || '#94a3b8',
  }));

  const typData = Object.entries(summary.nach_typ).map(([key, val]) => ({
    name: TYP_LABELS[key] || key,
    anzahl: val,
    color: TYP_COLORS_MAP[key] || '#94a3b8',
  }));

  const fortschrittData = aktivitaeten
    .filter((a) => a.status !== 'abgeschlossen')
    .sort((a, b) => (b.fortschritt || 0) - (a.fortschritt || 0))
    .slice(0, 10)
    .map((a) => ({
      name: a.name.length > 20 ? a.name.slice(0, 19) + '…' : a.name,
      fortschritt: a.fortschritt || 0,
    }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analysen</h1>
        <p className="text-slate-500 text-sm mt-1">Auswertungen und Reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status-Verteilung */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Status-Verteilung</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-10">Keine Daten</p>
          )}
        </div>

        {/* Typ-Verteilung */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Aktivitäten nach Typ</h2>
          {typData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="anzahl" name="Anzahl" radius={[4, 4, 0, 0]}>
                  {typData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-10">Keine Daten</p>
          )}
        </div>

        {/* Fortschritt top 10 */}
        <div className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Fortschritt (laufende Aktivitäten)</h2>
          {fortschrittData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fortschrittData} layout="vertical" barSize={18}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="fortschritt" name="Fortschritt" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-10">Keine laufenden Aktivitäten</p>
          )}
        </div>

        {/* KPI summary */}
        <div className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Kennzahlen</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{summary.gesamt}</p>
              <p className="text-sm text-slate-500 mt-1">Aktivitäten gesamt</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{summary.in_verzug}</p>
              <p className="text-sm text-slate-500 mt-1">In Verzug</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{summary.nach_status?.abgeschlossen ?? 0}</p>
              <p className="text-sm text-slate-500 mt-1">Abgeschlossen</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{summary.durchschnitt_fortschritt}%</p>
              <p className="text-sm text-slate-500 mt-1">Ø Fortschritt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
