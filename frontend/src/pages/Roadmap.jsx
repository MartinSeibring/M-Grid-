import { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';

const TYP_COLORS = {
  projekt: '#7c3aed',
  massnahme: '#0891b2',
  linientaetigkeit: '#ea580c',
};

const TYP_LABELS = {
  projekt: 'Projekte',
  massnahme: 'Maßnahmen',
  linientaetigkeit: 'Linientätigkeiten',
};

const STATUS_OPACITY = {
  initiierung: 0.4,
  planung: 0.6,
  umsetzung: 1,
  abgeschlossen: 0.7,
  pausiert: 0.3,
};

function parseDate(str) {
  return str ? new Date(str) : null;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function Roadmap() {
  const [aktivitaeten, setAktivitaeten] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    api.getAktivitaeten().then((items) => {
      setAktivitaeten(items);
      setLoading(false);
    });
  }, []);

  const withDates = aktivitaeten.filter((a) => a.start_geplant && a.end_geplant);

  if (loading) return <div className="p-6 text-slate-400">Lade…</div>;

  if (withDates.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Roadmap</h1>
        <div className="bg-white rounded-xl shadow-sm p-16 text-center text-slate-400">
          <p>Keine Aktivitäten mit Datumsdaten vorhanden.</p>
          <p className="text-sm mt-1">Füge Start- und Enddaten zu deinen Aktivitäten hinzu.</p>
        </div>
      </div>
    );
  }

  const allDates = withDates.flatMap((a) => [parseDate(a.start_geplant), parseDate(a.end_geplant)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  minDate.setDate(1);
  const viewStart = addMonths(minDate, -1);
  const viewEnd = addMonths(maxDate, 2);
  const totalMs = viewEnd - viewStart;

  function xPct(date) {
    return ((new Date(date) - viewStart) / totalMs) * 100;
  }

  const typen = ['projekt', 'massnahme', 'linientaetigkeit'];
  const grouped = typen.map((t) => ({
    typ: t,
    items: withDates.filter((a) => a.typ === t),
  })).filter((g) => g.items.length > 0);

  const ROW_H = 36;
  const GROUP_GAP = 48;
  const HEADER_H = 50;
  const LABEL_W = 220;

  let months = [];
  let cur = new Date(viewStart);
  while (cur <= viewEnd) {
    months.push(new Date(cur));
    cur = addMonths(cur, 1);
  }

  let totalRows = 0;
  grouped.forEach((g) => { totalRows += g.items.length; });
  const svgH = HEADER_H + grouped.length * GROUP_GAP + totalRows * ROW_H + 20;

  const todayPct = xPct(new Date());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Roadmap</h1>
      <p className="text-slate-500 text-sm mb-6">Zeitliche Übersicht aller Aktivitäten (geplant)</p>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div ref={containerRef} style={{ minWidth: 900 }}>
          <svg width="100%" height={svgH} className="font-sans">
            {/* Month header */}
            {months.map((m, i) => {
              const x = xPct(m);
              return (
                <g key={i}>
                  <line
                    x1={`${x}%`} y1={HEADER_H}
                    x2={`${x}%`} y2={svgH}
                    stroke="#e2e8f0" strokeWidth="1"
                  />
                  <text
                    x={`${x + 0.5}%`} y={20}
                    fontSize="11" fill="#94a3b8"
                  >
                    {m.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })}
                  </text>
                </g>
              );
            })}

            {/* Today line */}
            {todayPct >= 0 && todayPct <= 100 && (
              <line
                x1={`${todayPct}%`} y1={HEADER_H}
                x2={`${todayPct}%`} y2={svgH}
                stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3"
              />
            )}

            {/* Groups and bars */}
            {(() => {
              let y = HEADER_H;
              return grouped.map((g) => {
                const groupY = y;
                const groupEl = (
                  <g key={g.typ}>
                    <text x={8} y={groupY + 16} fontSize="12" fontWeight="600" fill={TYP_COLORS[g.typ]}>
                      {TYP_LABELS[g.typ]}
                    </text>
                    {g.items.map((a, idx) => {
                      const rowY = groupY + GROUP_GAP + idx * ROW_H;
                      const x1 = xPct(a.start_geplant);
                      const x2 = xPct(a.end_geplant);
                      const w = Math.max(x2 - x1, 0.5);
                      const opacity = STATUS_OPACITY[a.status] ?? 1;
                      const barH = 18;
                      const barY = rowY + (ROW_H - barH) / 2;

                      return (
                        <g key={a.id}>
                          <text x={8} y={rowY + ROW_H / 2 + 4} fontSize="12" fill="#475569">
                            {a.name.length > 25 ? a.name.slice(0, 24) + '…' : a.name}
                          </text>
                          <rect
                            x={`${x1}%`} y={barY}
                            width={`${w}%`} height={barH}
                            rx={4} fill={TYP_COLORS[g.typ]}
                            opacity={opacity}
                          />
                          {a.fortschritt > 0 && (
                            <rect
                              x={`${x1}%`} y={barY}
                              width={`${w * (a.fortschritt / 100)}%`} height={barH}
                              rx={4} fill="white" opacity={0.25}
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
                y = groupY + GROUP_GAP + g.items.length * ROW_H;
                return groupEl;
              });
            })()}
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
        {Object.entries(TYP_COLORS).map(([typ, color]) => (
          <span key={typ} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
            {TYP_LABELS[typ]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-amber-400 border-dashed inline-block" />
          Heute
        </span>
      </div>
    </div>
  );
}
