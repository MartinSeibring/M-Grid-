import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';

const DEFAULTS = {
  name: '',
  typ: 'projekt',
  status: 'initiierung',
  prioritaet: 'mittel',
  start_geplant: '',
  end_geplant: '',
  start_aktuell: '',
  end_aktuell: '',
  fortschritt: 0,
  verantwortlicher: '',
  beschreibung: '',
};

export function AktivitaetModal({ aktivitaet, onClose, onSaved }) {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (aktivitaet) {
      setForm({
        name: aktivitaet.name || '',
        typ: aktivitaet.typ || 'projekt',
        status: aktivitaet.status || 'initiierung',
        prioritaet: aktivitaet.prioritaet || 'mittel',
        start_geplant: aktivitaet.start_geplant || '',
        end_geplant: aktivitaet.end_geplant || '',
        start_aktuell: aktivitaet.start_aktuell || '',
        end_aktuell: aktivitaet.end_aktuell || '',
        fortschritt: aktivitaet.fortschritt ?? 0,
        verantwortlicher: aktivitaet.verantwortlicher || '',
        beschreibung: aktivitaet.beschreibung || '',
      });
    }
  }, [aktivitaet]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        fortschritt: Number(form.fortschritt),
        start_geplant: form.start_geplant || null,
        end_geplant: form.end_geplant || null,
        start_aktuell: form.start_aktuell || null,
        end_aktuell: form.end_aktuell || null,
      };
      if (aktivitaet?.id) {
        await api.updateAktivitaet(aktivitaet.id, payload);
      } else {
        await api.createAktivitaet(payload);
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">
            {aktivitaet?.id ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input required value={form.name} onChange={set('name')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Typ *</label>
              <select value={form.typ} onChange={set('typ')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="projekt">Projekt</option>
                <option value="massnahme">Maßnahme</option>
                <option value="linientaetigkeit">Linientätigkeit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <select value={form.status} onChange={set('status')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="initiierung">Initiierung</option>
                <option value="planung">Planung</option>
                <option value="umsetzung">Umsetzung</option>
                <option value="abgeschlossen">Abgeschlossen</option>
                <option value="pausiert">Pausiert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorität</label>
              <select value={form.prioritaet} onChange={set('prioritaet')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="hoch">Hoch</option>
                <option value="mittel">Mittel</option>
                <option value="niedrig">Niedrig</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start (geplant)</label>
              <input type="date" value={form.start_geplant} onChange={set('start_geplant')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ende (geplant)</label>
              <input type="date" value={form.end_geplant} onChange={set('end_geplant')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start (aktuell)</label>
              <input type="date" value={form.start_aktuell} onChange={set('start_aktuell')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ende (aktuell)</label>
              <input type="date" value={form.end_aktuell} onChange={set('end_aktuell')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fortschritt: {form.fortschritt}%
              </label>
              <input type="range" min="0" max="100" value={form.fortschritt}
                onChange={set('fortschritt')}
                className="w-full accent-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Verantwortlicher</label>
              <input value={form.verantwortlicher} onChange={set('verantwortlicher')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
            <textarea rows={3} value={form.beschreibung} onChange={set('beschreibung')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
              Abbrechen
            </button>
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
