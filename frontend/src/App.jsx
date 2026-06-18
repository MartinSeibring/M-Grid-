import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { Graph } from './pages/Graph';
import { Analysen } from './pages/Analysen';
import { Rollout } from './pages/Rollout';
import { Stationen } from './pages/Stationen';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <BrowserRouter basename="/M-Grid-">
      <Routes>
        <Route element={<Layout onNewAktivitaet={() => setModalOpen(true)} />}>
          <Route index element={<Dashboard modalOpen={modalOpen} setModalOpen={setModalOpen} />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/analysen" element={<Analysen />} />
          <Route path="/rollout" element={<Rollout />} />
          <Route path="/rollout/stationen" element={<Stationen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
