import { Routes, Route } from 'react-router-dom';
import CiudadanoLayout from '../../Components/Ciudadano/CiudadanoLayout';
import Principal from '../../Components/Ciudadano/Pages/Principal';
import Alertas from '../../Components/Ciudadano/Pages/Alertas';
import MisAlertas from '../../Components/Ciudadano/Pages/MisAlertas';
import Configuracion from '../../Components/Ciudadano/Pages/Configuracion';
import Notificaciones from '../../Components/Ciudadano/Pages/Notificaciones';
import Vecinos from '../../Components/Ciudadano/Pages/Vecinos';

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
      </Routes>
    </CiudadanoLayout>
  );
}