import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

export function Rollout() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.getStationenSummary().then(setSummary).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Rolloutfortschritt</h1>
      <p className="text-slate-500 text-sm mb-8">
        Kennzahlen zur Digitalisierung im Niederspannungs-Netzgebiet der SWM Infrastruktur GmbH
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link to="/rollout/stationen"
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="flex items-start justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
              <MapPin size={22} className="text-green-600" />
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors mt-1" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 mt-3">Netztrafo­stationen</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tabellarische und kartografische Übersicht aller Stationen mit Fernauslesestatus
          </p>
          {summary && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-800">{summary.gesamt}</p>
                <p className="text-xs text-slate-400">Gesamt</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{summary.aktiv}</p>
                <p className="text-xs text-slate-400">Aktiv</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-500">{summary.quote_aktiv}%</p>
                <p className="text-xs text-slate-400">Quote</p>
              </div>
            </div>
          )}
        </Link>

        {/* Platzhalter für zukünftige Kennzahlen */}
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center opacity-50">
          <TrendingUp size={24} className="text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-400">Weitere Kennzahl</p>
          <p className="text-xs text-slate-300 mt-1">Demnächst verfügbar</p>
        </div>
      </div>
    </div>
  );
}
