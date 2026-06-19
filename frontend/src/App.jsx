import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { Graph } from './pages/Graph';
import { Analysen } from './pages/Analysen';
import { Rollout } from './pages/Rollout';
import { Stationen } from './pages/Stationen';

function AppRoutes() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleNew = () => { navigate('/'); setModalOpen(true); };

  return (
    <Routes>
      <Route element={<Layout onNewAktivitaet={handleNew} />}>
        <Route index element={<Dashboard modalOpen={modalOpen} setModalOpen={setModalOpen} />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/analysen" element={<Analysen />} />
        <Route path="/rollout" element={<Rollout />} />
        <Route path="/rollout/stationen" element={<Stationen />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/M-Grid-">
      <AppRoutes />
    </BrowserRouter>
  );
}
