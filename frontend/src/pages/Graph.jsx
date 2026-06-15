import { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../api/client';
import { Plus, Trash2 } from 'lucide-react';

const STATUS_NODE_COLORS = {
  initiierung: '#94a3b8',
  planung: '#3b82f6',
  umsetzung: '#f59e0b',
  abgeschlossen: '#22c55e',
  pausiert: '#ef4444',
};

const EDGE_COLORS = {
  blockiert: '#ef4444',
  beeinflusst: '#f59e0b',
  benoetigt: '#3b82f6',
};

function buildLayout(aktivitaeten) {
  const TYP_ORDER = ['projekt', 'massnahme', 'linientaetigkeit'];
  const grouped = TYP_ORDER.map((t) => aktivitaeten.filter((a) => a.typ === t));
  const nodes = [];
  let x = 0;
  grouped.forEach((group, gi) => {
    group.forEach((a, i) => {
      nodes.push({
        id: a.id,
        position: { x: gi * 320, y: i * 120 },
        data: { label: a.name, status: a.status, fortschritt: a.fortschritt },
        style: {
          background: STATUS_NODE_COLORS[a.status] || '#94a3b8',
          color: 'white',
          borderRadius: 8,
          border: 'none',
          fontSize: 12,
          fontWeight: 600,
          padding: '8px 12px',
          maxWidth: 200,
          whiteSpace: 'normal',
        },
      });
    });
  });
  return nodes;
}

export function Graph() {
  const [aktivitaeten, setAktivitaeten] = useState([]);
  const [abhaengigkeiten, setAbhaengigkeiten] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEdge, setNewEdge] = useState({ quelle_id: '', ziel_id: '', typ: 'benoetigt', notiz: '' });
  const [loading, setLoading] = useState(true);

  async function load() {
    const [items, deps] = await Promise.all([api.getAktivitaeten(), api.getAbhaengigkeiten()]);
    setAktivitaeten(items);
    setAbhaengigkeiten(deps);
    setNodes(buildLayout(items));
    setEdges(deps.map((d) => ({
      id: d.id,
      source: d.quelle_id,
      target: d.ziel_id,
      label: d.typ,
      labelStyle: { fontSize: 10 },
      style: { stroke: EDGE_COLORS[d.typ] || '#94a3b8' },
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS[d.typ] || '#94a3b8' },
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAddEdge(e) {
    e.preventDefault();
    await api.createAbhaengigkeit(newEdge);
    setShowAddForm(false);
    setNewEdge({ quelle_id: '', ziel_id: '', typ: 'benoetigt', notiz: '' });
    await load();
  }

  async function handleDeleteEdge(id) {
    if (!confirm('Abhängigkeit löschen?')) return;
    await api.deleteAbhaengigkeit(id);
    await load();
  }

  if (loading) return <div className="p-6 text-slate-400">Lade…</div>;

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Abhängigkeits-Graph</h1>
          <p className="text-slate-500 text-sm mt-1">Visualisierung der Abhängigkeiten zwischen Aktivitäten</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm"
        >
          <Plus size={15} /> Abhängigkeit
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleAddEdge} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="font-semibold text-slate-800">Neue Abhängigkeit</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Von (Quelle)</label>
              <select required value={newEdge.quelle_id}
                onChange={(e) => setNewEdge((n) => ({ ...n, quelle_id: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Auswählen…</option>
                {aktivitaeten.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nach (Ziel)</label>
              <select required value={newEdge.ziel_id}
                onChange={(e) => setNewEdge((n) => ({ ...n, ziel_id: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Auswählen…</option>
                {aktivitaeten.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Typ</label>
              <select value={newEdge.typ}
                onChange={(e) => setNewEdge((n) => ({ ...n, typ: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                <option value="benoetigt">Benötigt</option>
                <option value="blockiert">Blockiert</option>
                <option value="beeinflusst">Beeinflusst</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-slate-600">Abbrechen</button>
              <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-900 font-semibold rounded-lg text-sm">Hinzufügen</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {aktivitaeten.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              Noch keine Aktivitäten vorhanden
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          )}
        </div>

        {abhaengigkeiten.length > 0 && (
          <div className="w-64 bg-white rounded-xl shadow-sm p-4 overflow-y-auto">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Abhängigkeiten</h3>
            <div className="space-y-2">
              {abhaengigkeiten.map((d) => (
                <div key={d.id} className="border border-slate-100 rounded-lg p-2 text-xs">
                  <div className="font-medium text-slate-700 truncate">{d.quelle_name}</div>
                  <div className="text-slate-400 my-0.5 flex items-center gap-1">
                    <span className="inline-block w-3 h-px" style={{ background: EDGE_COLORS[d.typ] }} />
                    {d.typ}
                    <span className="inline-block w-3 h-px" style={{ background: EDGE_COLORS[d.typ] }} />
                  </div>
                  <div className="font-medium text-slate-700 truncate">{d.ziel_name}</div>
                  <button onClick={() => handleDeleteEdge(d.id)}
                    className="mt-1.5 text-slate-300 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        {Object.entries(EDGE_COLORS).map(([typ, color]) => (
          <span key={typ} className="flex items-center gap-1">
            <span className="w-5 h-0.5 inline-block rounded" style={{ background: color }} />
            {typ}
          </span>
        ))}
        {Object.entries(STATUS_NODE_COLORS).map(([s, color]) => (
          <span key={s} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
