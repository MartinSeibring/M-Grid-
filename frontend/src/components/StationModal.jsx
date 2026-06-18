import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';

const DEFAULTS = {
  name: '',
  adresse: '',
  stadtteil: '',
  lat: '',
  lng: '',
  status: 'nicht_ausgestattet',
  ausgestattet_am: '',
  aktiv_seit: '',
  letztes_auslesen: '',
  anmerkungen: '',
};

const INPUT = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';

export function StationModal({ station, onClose, onSaved }) {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (station?.id) {
      setForm({
        name: station.name || '',
        adresse: station.adresse || '',
        stadtteil: station.stadtteil || '',
        lat: station.lat ?? '',
        lng: station.lng ?? '',
        status: station.status || 'nicht_ausgestattet',
        ausgestattet_am: station.ausgestattet_am || '',
        aktiv_seit: station.aktiv_seit || '',
        letztes_auslesen: station.letztes_auslesen || '',
        anmerkungen: station.anmerkungen || '',
      });
    } else {
      setForm(DEFAULTS);
    }
  }, [station]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        lat: form.lat !== '' ? Number(form.lat) : null,
        lng: form.lng !== '' ? Number(form.lng) : null,
        ausgestattet_am: form.ausgestattet_am || null,
        aktiv_seit: form.aktiv_seit || null,
        letztes_auslesen: form.letztes_auslesen || null,
      };
      if (station?.id) {
        await api.updateStation(station.id, payload);
      } else {
        await api.createStation(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            {station?.id ? 'Station bearbeiten' : 'Neue Netztrafostation'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Stations-Bezeichnung *</label>
              <input required value={form.name} onChange={set('name')}
                placeholder="z.B. TS-2045 oder Maxvorstadt Nord" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stadtteil / Bereich</label>
              <input value={form.stadtteil} onChange={set('stadtteil')}
                placeholder="z.B. Maxvorstadt" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <select value={form.status} onChange={set('status')} className={INPUT}>
                <option value="nicht_ausgestattet">Noch nicht ausgestattet</option>
                <option value="ausgestattet">Ausgestattet (nicht aktiv)</option>
                <option value="aktiv">Aktiv fernausgelesen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input value={form.adresse} onChange={set('adresse')}
              placeholder="z.B. Ludwigstr. 14, 80539 München" className={INPUT} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Breitengrad (Lat)</label>
              <input type="number" step="any" value={form.lat} onChange={set('lat')}
                placeholder="z.B. 48.1551" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Längengrad (Lng)</label>
              <input type="number" step="any" value={form.lng} onChange={set('lng')}
                placeholder="z.B. 11.5820" className={INPUT} />
            </div>
          </div>
          <p className="text-xs text-slate-400 -mt-2">
            Koordinaten findest du z.B. bei Google Maps (Rechtsklick → „Was ist hier?")
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ausgestattet am</label>
              <input type="date" value={form.ausgestattet_am} onChange={set('ausgestattet_am')} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aktiv seit</label>
              <input type="date" value={form.aktiv_seit} onChange={set('aktiv_seit')} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Letztes Auslesen</label>
              <input type="date" value={form.letztes_auslesen} onChange={set('letztes_auslesen')} className={INPUT} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Anmerkungen</label>
            <textarea rows={2} value={form.anmerkungen} onChange={set('anmerkungen')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Abbrechen</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm disabled:opacity-50">
              {loading ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
