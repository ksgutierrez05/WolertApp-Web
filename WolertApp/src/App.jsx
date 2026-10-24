import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Components/Central-policia/Layout';
import CentroOperaciones from './Pages/Central-Policia/Centro-Operaciones';
import Alertas from './Pages/Central-Policia/Alertas';


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/Central-Policia" replace />}
      />

      <Route path="/Central-Policia" element={<Layout />}>
        <Route index element={<CentroOperaciones />} />
        <Route path="Alertas" element={<Alertas />} />

      </Route>
    </Routes>
  );
}

export default App;