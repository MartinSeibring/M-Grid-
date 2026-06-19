import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { X, Upload, Download, CheckCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { api } from '../api/client';
import { geocodeAdresse } from '../utils/geocode';

const TEMPLATE_HEADERS = ['Bezeichnung', 'Adresse', 'Stadtteil', 'Status', 'Ausgestattet_am', 'Aktiv_seit', 'Letztes_auslesen', 'Anmerkungen'];
const TEMPLATE_EXAMPLE = ['TS-2045', 'Ludwigstraße 14, 80539 München', 'Maxvorstadt', 'nicht_ausgestattet', '', '', '', ''];
const VALID_STATUS = ['nicht_ausgestattet', 'ausgestattet', 'aktiv'];

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Netztrafostation_Vorlage.csv';
  a.click();
}

function parseRow(row) {
  return {
    name: (row['Bezeichnung'] || '').trim(),
    adresse: (row['Adresse'] || '').trim(),
    stadtteil: (row['Stadtteil'] || '').trim(),
    status: VALID_STATUS.includes(row['Status']) ? row['Status'] : 'nicht_ausgestattet',
    ausgestattet_am: (row['Ausgestattet_am'] || '').trim() || null,
    aktiv_seit: (row['Aktiv_seit'] || '').trim() || null,
    letztes_auslesen: (row['Letztes_auslesen'] || '').trim() || null,
    anmerkungen: (row['Anmerkungen'] || '').trim(),
    lat: null,
    lng: null,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function CsvImportModal({ onClose, onImported }) {
  const [rows, setRows] = useState(null);
  const [geoProgress, setGeoProgress] = useState(null); // null | { done, total }
  const [importProgress, setImportProgress] = useState(null); // null | { done, total, errors }
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const parsed = data.map((r, i) => ({
          _id: i,
          _error: !r['Bezeichnung']?.trim() ? 'Bezeichnung fehlt' : null,
          _geoState: null, // null | 'ok' | 'warn' | 'skip'
          ...parseRow(r),
        }));
        setRows(parsed);
      },
    });
  }

  async function handleGeocode() {
    const toGeo = rows.filter((r) => !r._error && r.adresse && !r.lat);
    setGeoProgress({ done: 0, total: toGeo.length });

    const updated = [...rows];
    for (let i = 0; i < toGeo.length; i++) {
      const row = toGeo[i];
      try {
        const result = await geocodeAdresse(row.adresse);
        const idx = updated.findIndex((r) => r._id === row._id);
        updated[idx] = { ...updated[idx], lat: result.lat, lng: result.lng, _geoState: 'ok' };
      } catch {
        const idx = updated.findIndex((r) => r._id === row._id);
        updated[idx] = { ...updated[idx], _geoState: 'warn' };
      }
      setRows([...updated]);
      setGeoProgress({ done: i + 1, total: toGeo.length });
      if (i < toGeo.length - 1) await sleep(1100); // Nominatim rate limit
    }

    // mark rows without address
    const final = updated.map((r) => ({
      ...r,
      _geoState: r._geoState ?? (r.adresse ? r._geoState : 'skip'),
    }));
    setRows(final);
    setGeoProgress(null);
  }

  async function handleImport() {
    const valid = rows.filter((r) => !r._error);
    setImportProgress({ done: 0, total: valid.length, errors: [] });

    const errors = [];
    for (let i = 0; i < valid.length; i++) {
      const { _id, _error, _geoState, ...payload } = valid[i];
      try {
        await api.createStation(payload);
      } catch (err) {
        errors.push({ name: payload.name, msg: err.message });
      }
      setImportProgress({ done: i + 1, total: valid.length, errors });
    }
    setDone(true);
  }

  const canGeocode = rows && rows.some((r) => !r._error && r.adresse && !r.lat) && !geoProgress;
  const canImport = rows && rows.some((r) => !r._error) && !geoProgress && !importProgress;
  const validCount = rows ? rows.filter((r) => !r._error).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white md:rounded-xl shadow-xl w-full md:max-w-3xl md:mx-4 h-full md:h-auto md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-800">Stationen aus CSV importieren</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Schritt 1: Vorlage & Upload */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">1. Vorlage herunterladen & ausfüllen</h3>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
              <Download size={14} /> Vorlage herunterladen (CSV)
            </button>
            <p className="text-xs text-slate-400 mt-1">
              Spalten: Bezeichnung*, Adresse, Stadtteil, Status (nicht_ausgestattet / ausgestattet / aktiv), Ausgestattet_am, Aktiv_seit, Letztes_auslesen, Anmerkungen
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">2. Ausgefüllte CSV hochladen</h3>
            <label
              className="flex flex-col items-center gap-2 border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            >
              <Upload size={24} className="text-slate-400" />
              <span className="text-sm text-slate-500">CSV-Datei hierher ziehen oder klicken</span>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])} />
            </label>
          </div>

          {/* Vorschau-Tabelle */}
          {rows && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">
                  Vorschau – {rows.length} Zeilen ({validCount} gültig)
                </h3>
                {canGeocode && (
                  <button onClick={handleGeocode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                    <MapPin size={13} />
                    Adressen geocodieren ({rows.filter((r) => !r._error && r.adresse && !r.lat).length})
                  </button>
                )}
              </div>

              {geoProgress && (
                <div className="mb-2 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                  <Loader2 size={14} className="animate-spin" />
                  Geocodiere {geoProgress.done} / {geoProgress.total} Adressen…
                </div>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-left border-b">
                      <th className="px-3 py-2">Bezeichnung</th>
                      <th className="px-3 py-2">Adresse</th>
                      <th className="px-3 py-2">Stadtteil</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-center">Koordinaten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r._id} className={`border-b last:border-0 ${r._error ? 'bg-red-50' : ''}`}>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {r.name || <span className="text-red-400 italic">fehlt</span>}
                          {r._error && <p className="text-red-400 font-normal">{r._error}</p>}
                        </td>
                        <td className="px-3 py-2 text-slate-500 max-w-[160px] truncate">{r.adresse || '—'}</td>
                        <td className="px-3 py-2 text-slate-500">{r.stadtteil || '—'}</td>
                        <td className="px-3 py-2 text-slate-500">{r.status}</td>
                        <td className="px-3 py-2 text-center">
                          {r._geoState === 'ok' && <CheckCircle size={14} className="text-green-500 inline" />}
                          {r._geoState === 'warn' && <AlertTriangle size={14} className="text-amber-400 inline" title="Adresse nicht gefunden" />}
                          {r.lat && r._geoState !== 'ok' && <span className="text-green-600">✓</span>}
                          {!r.lat && !r._geoState && r.adresse && <span className="text-slate-300">—</span>}
                          {!r.adresse && <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import-Fortschritt */}
          {importProgress && (
            <div className="bg-slate-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
                {done ? <CheckCircle size={16} className="text-green-500" /> : <Loader2 size={16} className="animate-spin text-amber-500" />}
                {done
                  ? `Import abgeschlossen: ${importProgress.done - importProgress.errors.length} von ${importProgress.total} erfolgreich`
                  : `Importiere ${importProgress.done} / ${importProgress.total}…`}
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
                />
              </div>
              {importProgress.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-0.5">
                  {importProgress.errors.map((e, i) => (
                    <li key={i}>• {e.name}: {e.msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
            {done ? 'Schließen' : 'Abbrechen'}
          </button>
          {done ? (
            <button onClick={onImported}
              className="px-5 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg text-sm">
              Fertig
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={!canImport}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm disabled:opacity-40"
            >
              {validCount > 0 ? `${validCount} Stationen importieren` : 'Importieren'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
