import { Routes, Route } from 'react-router-dom';
import CiudadanoLayout from '../../Components/Ciudadano/CiudadanoLayout';
import Principal from '../../Components/Ciudadano/Pages/Principal';
import Alertas from '../../Components/Ciudadano/Pages/Alertas';

export default function Ciudadano() {
  return (
    <CiudadanoLayout>
      <Routes>
        <Route index element={<Principal />} />
        <Route path="principal" element={<Principal />} />
        <Route path="alertas" element={<Alertas />} />
      </Routes>
    </CiudadanoLayout>
  );
}