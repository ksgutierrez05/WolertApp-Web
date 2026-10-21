import { Routes, Route } from 'react-router-dom';
import CiudadanoLayout from '../../Components/Ciudadano/CiudadanoLayout';
import Principal from '../../Components/Ciudadano/Pages/Principal';
import Alertas from '../../Components/Ciudadano/Pages/Alertas';
import MisAlertas from '../../Components/Ciudadano/Pages/MisAlertas';
import Configuracion from '../../Components/Ciudadano/Pages/Configuracion';

export default function Ciudadano() {
  return (
    <CiudadanoLayout>
      <Routes>
        <Route index element={<Principal />} />
        <Route path="principal" element={<Principal />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="mis-alertas" element={<MisAlertas />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Routes>
    </CiudadanoLayout>
  );
}