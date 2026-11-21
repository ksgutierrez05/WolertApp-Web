import { Routes, Route } from 'react-router-dom';
import CiudadanoLayout from '../../Components/Ciudadano/CiudadanoLayout';
import Principal from '../../Pages/Ciudadano/Principal';
import Alertas from '../../Pages/Ciudadano/Alertas';
import MisAlertas from '../../Pages/Ciudadano/MisAlertas';
import Configuracion from '../../Pages/Ciudadano/Configuracion';
import Notificaciones from './Notificaciones';
import Vecinos from './Vecinos';
import ReportarEmergencia from './ReportarEmergencia';

export default function Ciudadano() {
  return (
    <CiudadanoLayout>
      <Routes>
        <Route index element={<Principal />} />
        <Route path="principal" element={<Principal />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="mis-alertas" element={<MisAlertas />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="vecinos" element={<Vecinos />} />
        <Route path="Reportar-Emergencia" element={<ReportarEmergencia />} />
      </Routes>
    </CiudadanoLayout>
  );
}
