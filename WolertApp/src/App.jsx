
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './Components/RutaProtegida';
import Landing from './Pages/Landing/Landing';
import Login from './Pages/Login/Login';
import Admin from './Pages/Admin/admin';
import Ciudadano from './Pages/Ciudadano/ciudadano';

// Tránsito
import Director from './Pages/transito/Director';
import Central from './Pages/transito/Central';
import Agente from './Pages/transito/Agente';


// Patrullero
import LayoutPatrullero from './Components/Patrullero/Layout';
import CentroPatrullero from './Pages/Patrullero/Centro-Operaciones';
import AlertasPatrullero from './Pages/Patrullero/Alertas';
import AsignacionesPatrullero from './Pages/Patrullero/Asignaciones';
import UnidadPatrullero from './Pages/Patrullero/Unidad';
import NotificacionesPatrullero from './Pages/Patrullero/Notificaciones';
import ConfiguracionPatrullero from './Pages/Patrullero/Configuracion';

// Administrador Policía
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

// Central Policía
import LayoutCentral from './Components/Central-policia/Layout';
import CentroCentral from './Pages/Central-Policia/Centro-Operaciones';
import MapaCentral from './Pages/Central-Policia/Mapa';
import AlertasCentral from './Pages/Central-Policia/Alertas';
import AsignacionesCentral from './Pages/Central-Policia/Asignaciones';
import AtencionAlertasCentral from './Pages/Central-Policia/Atencion-Alertas';
import UnidadesCentral from './Pages/Central-Policia/Unidades';
import HistorialCentral from './Pages/Central-Policia/Historial';
import ReportesCentral from './Pages/Central-Policia/Reportes';
import NotificacionesCentral from './Pages/Central-Policia/Notificaciones';
import ConfiguracionCentral from './Pages/Central-Policia/Configuracion';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RutaProtegida roles={['ADMIN']} />}>
          <Route path="/admin/*" element={<Admin />} />
        </Route>

        <Route element={<RutaProtegida roles={['CIUDADANO']} />}>
          <Route path="/ciudadano/*" element={<Ciudadano />} />
        </Route>

        <Route element={<RutaProtegida roles={['ADMIN_TRANSITO', 'DirectorTransito']} />}>
          <Route path="/transito/director/*" element={<Director />} />
        </Route>

        <Route element={<RutaProtegida roles={['CENTRAL_TRANSITO']} />}>
          <Route path="/transito/central/*" element={<Central />} />
        </Route>

        <Route element={<RutaProtegida roles={['AGENTE_TRANSITO']} />}>
          <Route path="/transito/agente/*" element={<Agente />} />
        </Route>

        <Route element={<RutaProtegida roles={['POLICIA']} />}>
          <Route path="/Patrullero" element={<LayoutPatrullero />}>
            <Route index element={<CentroPatrullero />} />
            <Route path="Alertas" element={<AlertasPatrullero />} />
            <Route path="Asignaciones" element={<AsignacionesPatrullero />} />
            <Route path="Unidad" element={<UnidadPatrullero />} />
            <Route path="Notificaciones" element={<NotificacionesPatrullero />} />
            <Route path="Configuracion" element={<ConfiguracionPatrullero />} />
          </Route>
        </Route>

        <Route element={<RutaProtegida roles={['ADMIN_POLICIA']} />}>
          <Route path="/Administrador-Policia" element={<LayoutAdmin />}>
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
        </Route>

        <Route element={<RutaProtegida roles={['CENTRAL_POLICIA']} />}>
          <Route path="/Central-Policia" element={<LayoutCentral />}>
            <Route index element={<CentroCentral />} />
            <Route path="Mapa" element={<MapaCentral />} />
            <Route path="Alertas" element={<AlertasCentral />} />
            <Route path="Asignaciones" element={<AsignacionesCentral />} />
            <Route path="AtencionAlertas" element={<AtencionAlertasCentral />} />
            <Route path="Atencion-Alertas" element={<AtencionAlertasCentral />} />
            <Route path="Unidades" element={<UnidadesCentral />} />
            <Route path="Historial" element={<HistorialCentral />} />
            <Route path="Reportes" element={<ReportesCentral />} />
            <Route path="Notificaciones" element={<NotificacionesCentral />} />
            <Route path="Configuracion" element={<ConfiguracionCentral />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
