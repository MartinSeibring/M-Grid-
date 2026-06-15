const TYP_COLORS = {
  projekt: 'bg-violet-100 text-violet-700',
  massnahme: 'bg-cyan-100 text-cyan-700',
  linientaetigkeit: 'bg-orange-100 text-orange-700',
};

const TYP_LABELS = {
  projekt: 'Projekt',
  massnahme: 'Maßnahme',
  linientaetigkeit: 'Linientätigkeit',
};

export function TypBadge({ typ }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYP_COLORS[typ] || 'bg-gray-100 text-gray-700'}`}>
      {TYP_LABELS[typ] || typ}
    </span>
  );
}
