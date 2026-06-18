const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  getAktivitaeten: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/aktivitaeten${q ? '?' + q : ''}`);
  },
  getAktivitaet: (id) => request('GET', `/aktivitaeten/${id}`),
  createAktivitaet: (data) => request('POST', '/aktivitaeten', data),
  updateAktivitaet: (id, data) => request('PUT', `/aktivitaeten/${id}`, data),
  deleteAktivitaet: (id) => request('DELETE', `/aktivitaeten/${id}`),

  getAbhaengigkeiten: () => request('GET', '/abhaengigkeiten'),
  createAbhaengigkeit: (data) => request('POST', '/abhaengigkeiten', data),
  deleteAbhaengigkeit: (id) => request('DELETE', `/abhaengigkeiten/${id}`),

  getSummary: () => request('GET', '/analytics/summary'),

  getStationen: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/stationen${q ? '?' + q : ''}`);
  },
  getStation: (id) => request('GET', `/stationen/${id}`),
  createStation: (data) => request('POST', '/stationen', data),
  updateStation: (id, data) => request('PUT', `/stationen/${id}`, data),
  deleteStation: (id) => request('DELETE', `/stationen/${id}`),
  getStationenSummary: () => request('GET', '/stationen/summary'),
};
