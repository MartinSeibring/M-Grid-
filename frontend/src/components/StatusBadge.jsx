const STATUS_COLORS = {
  initiierung: 'bg-slate-100 text-slate-700',
  planung: 'bg-blue-100 text-blue-700',
  umsetzung: 'bg-amber-100 text-amber-700',
  abgeschlossen: 'bg-green-100 text-green-700',
  pausiert: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  initiierung: 'Initiierung',
  planung: 'Planung',
  umsetzung: 'Umsetzung',
  abgeschlossen: 'Abgeschlossen',
  pausiert: 'Pausiert',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
