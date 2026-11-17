
import { Routes, Route, Navigate } from 'react-router-dom';

// ================================
// PATRULLERO
// ================================
import LayoutPatrullero from './Components/Patrullero/Layout';
import CentroPatrullero from './Pages/Patrullero/Centro-Operaciones';
import AlertasPatrullero from './Pages/Patrullero/Alertas';
import AsignacionesPatrullero from './Pages/Patrullero/Asignaciones';
import UnidadPatrullero from './Pages/Patrullero/Unidad';
import NotificacionesPatrullero from './Pages/Patrullero/Notificaciones';
import ConfiguracionPatrullero from './Pages/Patrullero/Configuracion';

// ================================
// ADMINISTRADOR POLICÍA
// ================================
import LayoutAdmin from './Components/Administrador-policia/Layout';
import CentroAdmin from './Pages/Administrador-Policia/Centro-Operaciones';
import AlertasAdmin from './Pages/Administrador-Policia/Alertas';
import AlarmasAdmin from './Pages/Administrador-Policia/Alarmas';
import TiposAlertasAdmin from './Pages/Administrador-Policia/Tipos-Alertas';
import PoliciasAdmin from './Pages/Administrador-Policia/Policias';
import UnidadesAdmin from './Pages/Administrador-Policia/Unidades';
import HistorialAdmin from './Pages/Administrador-Policia/Historial';
import EstadisticasAdmin from './Pages/Administrador-Policia/Estadisticas';
import ReportesAdmin from './Pages/Administrador-Policia/Reportes';
import NotificacionesAdmin from './Pages/Administrador-Policia/Notificaciones';
import ConfiguracionAdmin from './Pages/Administrador-Policia/Configuracion';

import './App.css';

function App() {
  return (
    <Routes>
      {/* Página inicial temporal */}
      <Route
        path="/"
        element={
          <Navigate to="/Administrador-Policia" replace />
        }
      />

      {/* =========================
          RUTAS PATRULLERO
      ========================= */}
      <Route
        path="/Patrullero"
        element={<LayoutPatrullero />}
      >
        <Route index element={<CentroPatrullero />} />
        <Route path="Alertas" element={<AlertasPatrullero />} />
        <Route path="Asignaciones" element={<AsignacionesPatrullero />} />
        <Route path="Unidad" element={<UnidadPatrullero />} />
        <Route path="Notificaciones" element={<NotificacionesPatrullero />} />
        <Route path="Configuracion" element={<ConfiguracionPatrullero />} />
      </Route>

      {/* =========================
          RUTAS ADMINISTRADOR POLICÍA
      ========================= */}
      <Route
        path="/Administrador-Policia"
        element={<LayoutAdmin />}
      >
        <Route index element={<CentroAdmin />} />
        <Route path="Alertas" element={<AlertasAdmin />} />
        <Route path="Alarmas" element={<AlarmasAdmin />} />
        <Route path="Tipos-Alertas" element={<TiposAlertasAdmin />} />
        <Route path="Policias" element={<PoliciasAdmin />} />
        <Route path="Unidades" element={<UnidadesAdmin />} />
        <Route path="Historial" element={<HistorialAdmin />} />
        <Route path="Estadisticas" element={<EstadisticasAdmin />} />
        <Route path="Reportes" element={<ReportesAdmin />} />
        <Route path="Notificaciones" element={<NotificacionesAdmin />} />
        <Route path="Configuracion" element={<ConfiguracionAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;
