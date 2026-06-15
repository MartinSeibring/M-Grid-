import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { api } from '../api/client';

const TABS = [
  { id: 'kopf', label: 'Kopfdaten' },
  { id: 'aufgabe', label: 'Aufgabenstellung' },
  { id: 'stakeholder', label: 'Stakeholder' },
  { id: 'risiko', label: 'Risiko & Strategie' },
  { id: 'ressourcen', label: 'Ressourcen' },
];

const EMPTY_META = {
  aktivitaet_id: '',
  mengengeber_bereich: '',
  freigabe_mboard: '',
  projektart: '',
  problemstellung: '',
  weitere_infos: '',
  stakeholder_bn_me: '',
  nachweise_ressourcen: '',
  netztransformation_ressourcen: '',
  risiko_eintritt: 'mittel',
  risiko_auswirkung: 'mittel',
  regulatorik: false,
  strategiebeitrag: '',
  ressourcen_plan_pt: '',
  ressourcen_ist_pt: '',
  voraussetzungen: '',
};

const DEFAULTS = {
  name: '',
  typ: 'massnahme',
  status: 'initiierung',
  prioritaet: 'mittel',
  start_geplant: '',
  end_geplant: '',
  start_aktuell: '',
  end_aktuell: '',
  fortschritt: 0,
  verantwortlicher: '',
  beschreibung: '',
  metadaten: { ...EMPTY_META },
};

function RisikoMatrix({ eintritt, auswirkung, onChange }) {
  const levels = ['niedrig', 'mittel', 'hoch'];
  const labels = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' };
  const cellColor = (e, a) => {
    const score = (levels.indexOf(e) + 1) * (levels.indexOf(a) + 1);
    if (score >= 6) return 'bg-red-500 text-white';
    if (score >= 3) return 'bg-amber-400 text-white';
    return 'bg-green-400 text-white';
  };
  const isSelected = (e, a) => eintritt === e && auswirkung === a;

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">Klicke auf eine Zelle, um Eintritt × Auswirkung zu setzen</p>
      <div className="inline-block border border-slate-200 rounded-lg overflow-hidden">
        <table className="text-xs text-center">
          <thead>
            <tr>
              <th className="px-3 py-2 bg-slate-50 text-slate-500 border-b border-r text-left">
                Eintritt ↓ / Auswirkung →
              </th>
              {levels.map((a) => (
                <th key={a} className="px-6 py-2 bg-slate-50 text-slate-600 border-b border-r font-medium">
                  {labels[a]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...levels].reverse().map((e) => (
              <tr key={e}>
                <td className="px-3 py-2 bg-slate-50 text-slate-600 border-b border-r font-medium text-left">
                  {labels[e]}
                </td>
                {levels.map((a) => (
                  <td
                    key={a}
                    onClick={() => onChange(e, a)}
                    className={`px-6 py-3 border-b border-r cursor-pointer transition-all
                      ${cellColor(e, a)}
                      ${isSelected(e, a) ? 'ring-2 ring-inset ring-slate-900 scale-95 font-bold' : 'opacity-60 hover:opacity-90'}`}
                  >
                    {isSelected(e, a) ? '✓' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Aktuell: Eintritt = <strong>{labels[eintritt]}</strong>, Auswirkung = <strong>{labels[auswirkung]}</strong>
      </p>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';
const TEXTAREA = INPUT + ' resize-none';

export function VorhabenModal({ vorhaben, onClose, onSaved }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vorhaben?.id) {
      setForm({
        name: vorhaben.name || '',
        typ: vorhaben.typ || 'massnahme',
        status: vorhaben.status || 'initiierung',
        prioritaet: vorhaben.prioritaet || 'mittel',
        start_geplant: vorhaben.start_geplant || '',
        end_geplant: vorhaben.end_geplant || '',
        start_aktuell: vorhaben.start_aktuell || '',
        end_aktuell: vorhaben.end_aktuell || '',
        fortschritt: vorhaben.fortschritt ?? 0,
        verantwortlicher: vorhaben.verantwortlicher || '',
        beschreibung: vorhaben.beschreibung || '',
        metadaten: { ...EMPTY_META, ...(vorhaben.metadaten || {}) },
      });
    } else {
      setForm(DEFAULTS);
    }
  }, [vorhaben]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setMeta = (field) => (e) =>
    setForm((f) => ({ ...f, metadaten: { ...f.metadaten, [field]: e.target.value } }));

  const setMetaVal = (field, val) =>
    setForm((f) => ({ ...f, metadaten: { ...f.metadaten, [field]: val } }));

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
      if (vorhaben?.id) {
        await api.updateAktivitaet(vorhaben.id, payload);
      } else {
        await api.createAktivitaet(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
      setTab(0);
    } finally {
      setLoading(false);
    }
  }

  const m = form.metadaten;

  const tabContent = [
    // Tab 0: Kopfdaten
    <div key="kopf" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Aktivität-ID" >
          <input value={m.aktivitaet_id} onChange={setMeta('aktivitaet_id')}
            placeholder="z.B. M-NM-021" className={INPUT} />
        </Field>
        <Field label="Aktivität (Name)" required>
          <input required value={form.name} onChange={set('name')} className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Mengengeber / Bereich">
          <input value={m.mengengeber_bereich} onChange={setMeta('mengengeber_bereich')}
            placeholder="z.B. WiRad, NSD, ..." className={INPUT} />
        </Field>
        <Field label="Es handelt sich um eine...">
          <select value={form.typ} onChange={set('typ')} className={INPUT}>
            <option value="projekt">Projekt</option>
            <option value="massnahme">organisierte Maßnahme</option>
            <option value="linientaetigkeit">Linientätigkeit</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Projektart">
          <input value={m.projektart} onChange={setMeta('projektart')}
            placeholder="z.B. Rollout, Pilotprojekt, ..." className={INPUT} />
        </Field>
        <Field label="Verantwortlicher">
          <input value={form.verantwortlicher} onChange={set('verantwortlicher')} className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start (geplant)">
          <input type="date" value={form.start_geplant} onChange={set('start_geplant')} className={INPUT} />
        </Field>
        <Field label="Ende (geplant)">
          <input type="date" value={form.end_geplant} onChange={set('end_geplant')} className={INPUT} />
        </Field>
        <Field label="Start (aktuell)">
          <input type="date" value={form.start_aktuell} onChange={set('start_aktuell')} className={INPUT} />
        </Field>
        <Field label="Ende (aktuell)">
          <input type="date" value={form.end_aktuell} onChange={set('end_aktuell')} className={INPUT} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Freigabe M-Board am">
          <input type="date" value={m.freigabe_mboard} onChange={setMeta('freigabe_mboard')} className={INPUT} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={set('status')} className={INPUT}>
            <option value="initiierung">Initiierung</option>
            <option value="planung">Planung</option>
            <option value="umsetzung">Umsetzung</option>
            <option value="abgeschlossen">Abgeschlossen</option>
            <option value="pausiert">Pausiert</option>
          </select>
        </Field>
      </div>
      <Field label={`Fortschritt: ${form.fortschritt}%`}>
        <input type="range" min="0" max="100" value={form.fortschritt}
          onChange={set('fortschritt')} className="w-full accent-amber-500" />
      </Field>
    </div>,

    // Tab 1: Aufgabenstellung
    <div key="aufgabe" className="space-y-4">
      <Field label="Aufgabenstellung / Vision" required>
        <textarea rows={4} value={form.beschreibung} onChange={set('beschreibung')}
          placeholder="Was soll mit diesem Vorhaben erreicht werden?" className={TEXTAREA} />
      </Field>
      <Field label="Problemstellung / Hintergrund">
        <textarea rows={4} value={m.problemstellung} onChange={setMeta('problemstellung')}
          placeholder="Welches Problem wird adressiert? Was ist der Hintergrund?" className={TEXTAREA} />
      </Field>
      <Field label="Weitere Infos / Notizen">
        <textarea rows={3} value={m.weitere_infos} onChange={setMeta('weitere_infos')}
          placeholder="Ergänzende Informationen, Links, Referenzen..." className={TEXTAREA} />
      </Field>
    </div>,

    // Tab 2: Stakeholder
    <div key="stakeholder" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="BN / ME (Stakeholder)">
          <textarea rows={3} value={m.stakeholder_bn_me} onChange={setMeta('stakeholder_bn_me')}
            placeholder="z.B. BN: Herr Müller&#10;ME: Team NSD" className={TEXTAREA} />
        </Field>
        <Field label="Nachweise (Ressourcen)">
          <textarea rows={3} value={m.nachweise_ressourcen} onChange={setMeta('nachweise_ressourcen')}
            placeholder="z.B. 2 Bewerb/m zur Umsetzung" className={TEXTAREA} />
        </Field>
      </div>
      <Field label="Netztransformation (Ressourcen)">
        <textarea rows={3} value={m.netztransformation_ressourcen} onChange={setMeta('netztransformation_ressourcen')}
          placeholder="z.B. 3 Bewerb/m zur Umsetzung" className={TEXTAREA} />
      </Field>
      <Field label="Voraussetzungen für Machbarkeit">
        <textarea rows={4} value={m.voraussetzungen} onChange={setMeta('voraussetzungen')}
          placeholder="Was muss erfüllt sein, damit das Vorhaben umgesetzt werden kann?" className={TEXTAREA} />
      </Field>
    </div>,

    // Tab 3: Risiko & Strategie
    <div key="risiko" className="space-y-5">
      <Field label="Risiko-Bewertung">
        <RisikoMatrix
          eintritt={m.risiko_eintritt}
          auswirkung={m.risiko_auswirkung}
          onChange={(e, a) => { setMetaVal('risiko_eintritt', e); setMetaVal('risiko_auswirkung', a); }}
        />
      </Field>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700">Regulatorik</span>
        <button
          type="button"
          onClick={() => setMetaVal('regulatorik', !m.regulatorik)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${m.regulatorik ? 'bg-amber-500' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${m.regulatorik ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm text-slate-500">{m.regulatorik ? 'Ja – regulatorisch relevant' : 'Nein'}</span>
      </div>

      <Field label="Strategiebeitrag">
        <textarea rows={3} value={m.strategiebeitrag} onChange={setMeta('strategiebeitrag')}
          placeholder="Welchen Beitrag leistet das Vorhaben zur Unternehmensstrategie?" className={TEXTAREA} />
      </Field>

      <Field label="Priorität (Gesamtbewertung)">
        <select value={form.prioritaet} onChange={set('prioritaet')} className={INPUT}>
          <option value="hoch">Hoch</option>
          <option value="mittel">Mittel</option>
          <option value="niedrig">Niedrig</option>
        </select>
      </Field>
    </div>,

    // Tab 4: Ressourcen
    <div key="ressourcen" className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Ressourcenplanung (Personentage)</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plan PT">
            <input type="number" min="0" value={m.ressourcen_plan_pt}
              onChange={setMeta('ressourcen_plan_pt')}
              placeholder="z.B. 90" className={INPUT} />
          </Field>
          <Field label="Ist PT (verbraucht)">
            <input type="number" min="0" value={m.ressourcen_ist_pt}
              onChange={setMeta('ressourcen_ist_pt')}
              placeholder="z.B. 41" className={INPUT} />
          </Field>
        </div>
        {m.ressourcen_plan_pt && m.ressourcen_ist_pt && (
          <div className="mt-3 text-sm text-slate-600">
            Verbleibend: <strong>{Number(m.ressourcen_plan_pt) - Number(m.ressourcen_ist_pt)} PT</strong>
            {' '}({Math.round((Number(m.ressourcen_ist_pt) / Number(m.ressourcen_plan_pt)) * 100)}% verbraucht)
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Abhängigkeiten zu anderen Vorhaben/Projekten können nach dem Speichern im Abhängigkeits-Graph verknüpft werden.
      </p>
    </div>,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {vorhaben?.id ? 'Vorhaben bearbeiten' : 'Neues Vorhaben anlegen'}
            </h2>
            {m.aktivitaet_id && (
              <p className="text-xs text-slate-400 mt-0.5">ID: {m.aktivitaet_id}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(i)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === i
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {i + 1}. {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">{error}</p>
            )}
            {tabContent[tab]}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={() => setTab((t) => Math.max(0, t - 1))}
              disabled={tab === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 disabled:opacity-30"
            >
              <ChevronLeft size={16} /> Zurück
            </button>

            <div className="flex items-center gap-2">
              {TABS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === tab ? 'bg-amber-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {tab < TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTab((t) => Math.min(TABS.length - 1, t + 1))}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
                >
                  Weiter <ChevronRight size={16} />
                </button>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? 'Speichern…' : 'Vorhaben speichern'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
